import { useState, useEffect, useRef } from 'react';
import { rotationAPI, dashboardAPI } from './services/api';
import Dashboard from './pages/Dashboard';
import RotationChauffeurs from './pages/RotationChauffeurs';
import Affectations from './pages/Affectations';
import Disponibilite from './pages/Disponibilite';
import Rapports from './pages/Rapports';
import Optimisations from './pages/Optimisations';
import RapportJournalier from './pages/RapportJournalier';




// ─── System Status Badge ──────────────────────────────────────────────────────
function SystemStatus() {
  const [status, setStatus] = useState('checking'); // checking | ok | error | warn
  const [latency, setLatency] = useState(null);
  const [detail, setDetail] = useState('');

  const check = async () => {
    setStatus('checking');
    const t0 = Date.now();
    try {
      await dashboardAPI.get();
      const ms = Date.now() - t0;
      setLatency(ms);
      if (ms < 800)       { setStatus('ok');   setDetail(`Backend OK · ${ms}ms`); }
      else if (ms < 2000) { setStatus('warn');  setDetail(`Lent · ${ms}ms`); }
      else                { setStatus('warn');  setDetail(`Très lent · ${ms}ms`); }
    } catch(e) {
      setLatency(null);
      if (!e.response) {
        setStatus('error'); setDetail('Backend inaccessible');
      } else if (e.response.status >= 500) {
        setStatus('error'); setDetail(`Erreur serveur ${e.response.status}`);
      } else {
        setStatus('warn');  setDetail(`HTTP ${e.response.status}`);
      }
    }
  };

  // Vérif au démarrage puis toutes les 30s
  useEffect(() => {
    check();
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, []);

  const cfg = {
    checking: { dot:'#94A3B8', bg:'#F8FAFC', border:'#E2E8F0', text:'#64748B', label:'Vérification…', anim:true  },
    ok:       { dot:'#10B981', bg:'#F0FDF4', border:'#A7F3D0', text:'#065F46', label:'Système actif',  anim:true  },
    warn:     { dot:'#F59E0B', bg:'#FFFBEB', border:'#FDE68A', text:'#92400E', label:'Attention',      anim:false },
    error:    { dot:'#EF4444', bg:'#FEF2F2', border:'#FECACA', text:'#991B1B', label:'Hors ligne',     anim:false },
  }[status];

  return (
    <button onClick={check} title={detail || 'Cliquer pour vérifier'} style={{
      display:'flex', alignItems:'center', gap:'6px',
      padding:'5px 12px', borderRadius:'20px', border:`1px solid ${cfg.border}`,
      background:cfg.bg, cursor:'pointer', transition:'all 0.2s',
    }}>
      <span style={{
        width:'8px', height:'8px', borderRadius:'50%', flexShrink:0,
        background: cfg.dot,
        boxShadow: status==='ok' ? `0 0 6px ${cfg.dot}` : status==='error' ? `0 0 6px ${cfg.dot}` : 'none',
        animation: cfg.anim ? 'pulse 2s infinite' : 'none',
      }}/>
      <span style={{ fontSize:'12px', fontWeight:600, color:cfg.text, whiteSpace:'nowrap' }}>
        {cfg.label}
      </span>
      {latency && status==='ok' && (
        <span style={{ fontSize:'10px', color:'#6EE7B7', fontFamily:'monospace' }}>{latency}ms</span>
      )}
    </button>
  );
}

// ─── Notification Bell ────────────────────────────────────────────────────────
function NotificationBell({ onNavigate }) {
  const [open,   setOpen]   = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoad]  = useState(false);
  const ref = useRef(null);

  // Fermer en cliquant dehors
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Charger les notifs depuis les optimisations + rotations du jour
  const load = async () => {
    setLoad(true);
    const items = [];
    try {
      // 1. Suggestions d'optimisation (critiques/attention)
      const opt = await dashboardAPI.getOptimisations();
      (opt.data.suggestions || []).forEach(s => {
        if (s.priorite === 'haute' || s.priorite === 'moyenne') {
          items.push({
            id: 'opt_' + items.length,
            type: s.priorite === 'haute' ? 'critique' : 'attention',
            icon: s.priorite === 'haute' ? '🔴' : '⚠️',
            title: s.titre,
            detail: s.detail,
            action: () => { onNavigate('optimisations'); setOpen(false); },
            actionLabel: 'Voir optimisations',
          });
        }
      });

      // 2. Vérifier si la rotation du jour est saisie
      const today = (() => {
        const n = new Date();
        return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`;
      })();
      const rot = await rotationAPI.getByDate(today);
      const nbCamions = (rot.data.rotations || []).length;
      if (nbCamions === 0) {
        items.push({
          id: 'rot_today',
          type: 'info',
          icon: '📋',
          title: 'Rotation du jour non saisie',
          detail: "Aucune rotation enregistrée pour aujourd'hui.",
          action: () => { onNavigate('rotation'); setOpen(false); },
          actionLabel: 'Saisir la rotation',
        });
      } else {
        // Vérifier camions sans voyages
        const sansVoyages = (rot.data.rotations || []).filter(r =>
          !( (r.phosphate_p1a_vgs||0)+(r.phosphate_p1b_vgs||0)+
             (r.phosphate_p2a_vgs||0)+(r.phosphate_p2b_vgs||0)+
             (r.sterile_p1a_vgs||0)+(r.sterile_p1b_vgs||0)+
             (r.sterile_p2a_vgs||0)+(r.sterile_p2b_vgs||0) )
        ).map(r => r.camion_id);
        if (sansVoyages.length > 0) {
          items.push({
            id: 'rot_vgs',
            type: 'attention',
            icon: '⚠️',
            title: `${sansVoyages.length} camion(s) sans voyages`,
            detail: `Données manquantes : ${sansVoyages.slice(0,5).join(', ')}${sansVoyages.length>5?'…':''}`,
            action: () => { onNavigate('rotation'); setOpen(false); },
            actionLabel: 'Compléter',
          });
        } else {
          items.push({
            id: 'rot_ok',
            type: 'ok',
            icon: '✅',
            title: `${nbCamions} camion(s) saisis aujourd'hui`,
            detail: 'Rotation du jour complète.',
            action: () => { onNavigate('rotation'); setOpen(false); },
            actionLabel: 'Voir rotation',
          });
        }
      }
    } catch(e) { /* silencieux */ }
    setNotifs(items);
    setLoad(false);
  };

  const toggle = () => {
    if (!open) load();
    setOpen(v => !v);
  };

  const nb = notifs.filter(n => n.type === 'critique' || n.type === 'attention').length;
  const colors = {
    critique:  { bg:'#FFF1F2', border:'#FECDD3', badge:'#BE123C', text:'#BE123C' },
    attention: { bg:'#FFFBEB', border:'#FDE68A', badge:'#B45309', text:'#B45309' },
    info:      { bg:'#EFF6FF', border:'#BFDBFE', badge:'#1D4ED8', text:'#1D4ED8' },
    ok:        { bg:'#F0FDF4', border:'#BBF7D0', badge:'#166534', text:'#166534' },
  };

  return (
    <div ref={ref} style={{ position:'relative' }}>
      <button onClick={toggle} style={{
        position:'relative', width:'36px', height:'36px', borderRadius:'10px',
        background:'#F9FAFB', border:'1px solid #E5E7EB',
        display:'flex', alignItems:'center', justifyContent:'center',
        cursor:'pointer', color:'#6B7280',
        boxShadow: open ? '0 0 0 3px rgba(0,75,141,0.15)' : 'none',
      }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {nb > 0 && (
          <span style={{
            position:'absolute', top:'-4px', right:'-4px',
            minWidth:'18px', height:'18px', borderRadius:'9px',
            background:'#EF4444', color:'white',
            fontSize:'10px', fontWeight:700, lineHeight:'18px', textAlign:'center',
            border:'2px solid white', padding:'0 3px',
          }}>{nb}</span>
        )}
      </button>

      {open && (
        <div style={{
          position:'absolute', top:'44px', right:0, zIndex:200,
          background:'white', borderRadius:'16px', width:'340px',
          boxShadow:'0 8px 40px rgba(0,0,0,0.18)', border:'1px solid #F1F5F9',
          overflow:'hidden',
        }}>
          {/* Header */}
          <div style={{ padding:'14px 16px', borderBottom:'1px solid #F9FAFB', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ fontWeight:700, fontSize:'14px', color:'#111827' }}>Notifications</div>
            {nb > 0 && <span style={{ fontSize:'11px', fontWeight:600, color:'#EF4444', background:'#FEF2F2', padding:'2px 8px', borderRadius:'20px', border:'1px solid #FECACA' }}>{nb} alerte{nb>1?'s':''}</span>}
          </div>

          {/* Liste */}
          <div style={{ maxHeight:'380px', overflowY:'auto' }}>
            {loading ? (
              <div style={{ padding:'30px', textAlign:'center', color:'#9CA3AF', fontSize:'13px' }}>
                <div style={{ width:'20px', height:'20px', border:'2px solid #3B82F6', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 8px' }}/>
                Analyse en cours…
              </div>
            ) : notifs.length === 0 ? (
              <div style={{ padding:'30px', textAlign:'center', color:'#9CA3AF', fontSize:'13px' }}>
                <div style={{ fontSize:'32px', marginBottom:'8px' }}>✅</div>
                Aucune alerte
              </div>
            ) : (
              notifs.map(n => {
                const c = colors[n.type] || colors.info;
                return (
                  <div key={n.id} style={{ padding:'12px 16px', borderBottom:'1px solid #F9FAFB', background:c.bg }}>
                    <div style={{ display:'flex', gap:'10px', alignItems:'flex-start' }}>
                      <span style={{ fontSize:'18px', lineHeight:1, marginTop:'1px' }}>{n.icon}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:700, fontSize:'13px', color:'#111827', marginBottom:'2px' }}>{n.title}</div>
                        <div style={{ fontSize:'11px', color:'#6B7280', lineHeight:'1.4', marginBottom:'6px' }}>{n.detail}</div>
                        <button onClick={n.action} style={{
                          fontSize:'11px', fontWeight:700, color:c.text,
                          background:'white', border:`1px solid ${c.border}`,
                          padding:'4px 10px', borderRadius:'7px', cursor:'pointer',
                        }}>{n.actionLabel} →</button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div style={{ padding:'10px 16px', borderTop:'1px solid #F9FAFB', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <button onClick={load} style={{ fontSize:'12px', color:'#6B7280', background:'none', border:'none', cursor:'pointer', fontWeight:500 }}>↻ Actualiser</button>
            <button onClick={() => { onNavigate('optimisations'); setOpen(false); }} style={{ fontSize:'12px', fontWeight:700, color:'#004B8D', background:'#EFF6FF', border:'1px solid #BFDBFE', padding:'5px 12px', borderRadius:'8px', cursor:'pointer' }}>Voir toutes →</button>
          </div>
        </div>
      )}
    </div>
  );
}

const PAGES = { dashboard: Dashboard, rotation: RotationChauffeurs, affectations: Affectations, disponibilite: Disponibilite, rapports: Rapports, optimisations: Optimisations, rapport_journalier: RapportJournalier };

// SVG Icons - Professional mining icons
const Icons = {
  Dashboard: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  Production: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
  ),
  Truck: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3"/>
      <rect x="9" y="11" width="14" height="10" rx="2"/>
      <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    </svg>
  ),
  Gauge: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20z"/><path d="M12 6v6l4 2"/>
    </svg>
  ),
  Report: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14,2 14,8 20,8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>
    </svg>
  ),
  Target: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  Daily: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="13" y2="18"/>
    </svg>
  ),
  Menu: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  ChevronLeft: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  ),
  Bell: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
};

const NAV = [
  { id: 'dashboard',    label: 'Tableau de Bord',     Icon: Icons.Dashboard },
  { id: 'rotation',     label: 'Rotation Chauffeurs',  Icon: Icons.Production },
  { id: 'affectations', label: 'Affectations',         Icon: Icons.Truck },
  { id: 'disponibilite',label: 'Disponibilité',        Icon: Icons.Gauge },
  { id: 'rapports',          label: 'Rapports',             Icon: Icons.Report },
  { id: 'rapport_journalier',label: 'Rapport Journalier',   Icon: Icons.Daily  },
  { id: 'optimisations',     label: 'Optimisations',        Icon: Icons.Target },
];

// OCP Mining Logo SVG
function MiningLogo({ collapsed }) {
  return (
    <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
      <div className="relative flex-shrink-0">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <rect width="36" height="36" rx="8" fill="white" fillOpacity="0.15"/>
          <rect width="36" height="36" rx="8" fill="url(#logoGrad)" fillOpacity="0.2"/>
          {/* Phosphate crystal shape */}
          <polygon points="18,5 28,11 28,23 18,29 8,23 8,11" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.8"/>
          <polygon points="18,10 24,14 24,22 18,26 12,22 12,14" fill="white" fillOpacity="0.3"/>
          {/* Mining pick */}
          <path d="M13 19L18 14L23 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="18" y1="14" x2="18" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <defs>
            <linearGradient id="logoGrad" x1="0" y1="0" x2="36" y2="36">
              <stop stopColor="#60A5FA"/><stop offset="1" stopColor="#34D399"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      {!collapsed && (
        <div>
          <div className="text-white font-bold text-sm tracking-wide leading-tight">BenGuerir</div>
          <div className="text-white/50 text-xs tracking-wider uppercase">Exploitation Minière</div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const PageComponent = PAGES[page];
  const currentNav = NAV.find(n => n.id === page);

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'DM Sans', 'Outfit', sans-serif", background: '#F0F4F8' }}>
      
      {/* Sidebar */}
      <aside
        className="flex-shrink-0 flex flex-col transition-all duration-300 relative"
        style={{
          width: collapsed ? '72px' : '240px',
          background: 'linear-gradient(175deg, #0A1628 0%, #0D2B4E 40%, #0B3D2E 100%)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
        }}
      >
        {/* Logo */}
        <div className={`p-4 pb-3 border-b border-white/10 ${collapsed ? 'px-4' : 'px-5'}`}>
          <MiningLogo collapsed={collapsed} />
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV.map(({ id, label, Icon }) => {
            const active = page === id;
            return (
              <button
                key={id}
                onClick={() => setPage(id)}
                title={collapsed ? label : ''}
                className={`
                  w-full flex items-center gap-3 rounded-lg transition-all duration-200 text-left group
                  ${collapsed ? 'px-3 py-3 justify-center' : 'px-3 py-2.5'}
                  ${active
                    ? 'bg-white/15 text-white shadow-lg'
                    : 'text-white/50 hover:bg-white/8 hover:text-white/90'
                  }
                `}
                style={active ? { boxShadow: 'inset 3px 0 0 #34D399' } : {}}
              >
                <span className={`flex-shrink-0 transition-colors ${active ? 'text-emerald-400' : 'group-hover:text-white/80'}`}>
                  <Icon />
                </span>
                {!collapsed && (
                  <span className="text-sm font-medium tracking-wide truncate">{label}</span>
                )}
                {!collapsed && active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </nav>

        {/* OCP Badge */}
        {!collapsed && (
          <div className="mx-3 mb-3 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white" style={{ background: 'linear-gradient(135deg, #004B8D, #00843D)' }}>O</div>
              <div>
                <div className="text-white/70 text-xs font-semibold">OCP Group</div>
                <div className="text-white/35 text-xs">Site BenGuerir</div>
              </div>
            </div>
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors z-10 text-gray-600"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3" style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Topbar */}
        <header className="flex-shrink-0 bg-white border-b border-gray-200/80 px-6 py-3.5 flex items-center justify-between"
          style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-base font-bold text-gray-800 tracking-tight">{currentNav?.label}</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status badge */}
            <SystemStatus/>
            {/* Bell */}
            <NotificationBell onNavigate={setPage}/>
            {/* Avatar */}
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg, #004B8D, #00843D)' }}>
              BG
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6" style={{ background: '#F0F4F8' }}>
          <PageComponent />
        </main>
      </div>
    </div>
  );
}
