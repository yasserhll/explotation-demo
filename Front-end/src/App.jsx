import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Production from './pages/Production';
import Affectations from './pages/Affectations';
import Disponibilite from './pages/Disponibilite';
import Rapports from './pages/Rapports';
import Optimisations from './pages/Optimisations';

const PAGES = { dashboard: Dashboard, production: Production, affectations: Affectations, disponibilite: Disponibilite, rapports: Rapports, optimisations: Optimisations };

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
  { id: 'dashboard',    label: 'Tableau de Bord',  Icon: Icons.Dashboard },
  { id: 'production',   label: 'Saisie Production', Icon: Icons.Production },
  { id: 'affectations', label: 'Affectations',      Icon: Icons.Truck },
  { id: 'disponibilite',label: 'Disponibilité',     Icon: Icons.Gauge },
  { id: 'rapports',     label: 'Rapports',          Icon: Icons.Report },
  { id: 'optimisations',label: 'Optimisations',     Icon: Icons.Target },
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
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>
              Système actif
            </div>
            {/* Bell */}
            <button className="relative w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
              <Icons.Bell />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white"/>
            </button>
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
