import { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';

const PRIORITY = {
  haute:   { bg:'#FFF1F2', border:'#FECDD3', badge:'#FEE2E2', badgeText:'#BE123C', icon:'🔴', label:'Critique' },
  moyenne: { bg:'#FFFBEB', border:'#FDE68A', badge:'#FEF3C7', badgeText:'#B45309', icon:'⚠️', label:'Attention' },
  info:    { bg:'#EFF6FF', border:'#BFDBFE', badge:'#DBEAFE', badgeText:'#1D4ED8', icon:'💡', label:'Info' },
};

// Clé pour localStorage des remarques
const REM_KEY = 'ocp_benguerir_remarques';

const loadRemarques = () => {
  try { return JSON.parse(localStorage.getItem(REM_KEY) || '[]'); } catch { return []; }
};
const saveRemarques = (arr) => {
  try { localStorage.setItem(REM_KEY, JSON.stringify(arr)); } catch {}
};

const fmtDate = (iso) => {
  try { return new Date(iso).toLocaleDateString('fr-FR', {day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}); }
  catch { return iso; }
};

export default function Optimisations() {
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState('all');
  const [remarques, setRemarques] = useState(loadRemarques());
  const [modal,     setModal]     = useState(null); // null | 'add' | {id, texte, type, auteur}
  const [form,      setForm]      = useState({ texte:'', type:'generale', auteur:'', priorite:'info' });

  useEffect(() => {
    dashboardAPI.getOptimisations()
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const count = p => (data?.suggestions || []).filter(s => s.priorite === p).length;
  const suggestions = (data?.suggestions || []).filter(s => filter === 'all' || s.priorite === filter);

  // CRUD remarques
  const addRemarque = () => {
    if (!form.texte.trim()) return;
    const now = new Date().toISOString();
    const rec = { id: Date.now(), ...form, date: now, statut: 'ouvert' };
    const updated = [rec, ...remarques];
    setRemarques(updated);
    saveRemarques(updated);
    setForm({ texte:'', type:'generale', auteur:'', priorite:'info' });
    setModal(null);
  };

  const resolveRemarque = (id) => {
    const updated = remarques.map(r => r.id === id ? { ...r, statut: r.statut === 'resolu' ? 'ouvert' : 'resolu', dateResolu: new Date().toISOString() } : r);
    setRemarques(updated);
    saveRemarques(updated);
  };

  const deleteRemarque = (id) => {
    const updated = remarques.filter(r => r.id !== id);
    setRemarques(updated);
    saveRemarques(updated);
  };

  const TYPES_REM = [
    { v:'generale',    l:'Générale',         icon:'📝' },
    { v:'maintenance', l:'Maintenance',       icon:'🔧' },
    { v:'securite',    l:'Sécurité',          icon:'⚠️' },
    { v:'production',  l:'Production',        icon:'⛏️' },
    { v:'rh',          l:'Ressources humaines', icon:'👷' },
  ];

  const inpStyle = { width:'100%', border:'1px solid #E5E7EB', borderRadius:'8px', background:'#F9FAFB', padding:'8px 12px', fontSize:'14px', outline:'none', boxSizing:'border-box' };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'64px' }}>
      <div style={{ width:'32px', height:'32px', border:'2px solid #7C3AED', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px', maxWidth:'1100px', margin:'0 auto' }}>

      {/* ── KPI suggestions ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px' }}>
        {[
          {p:'haute',  l:'Critique',  c:'#BE123C', bg:'#FFF1F2', b:'#FECDD3'},
          {p:'moyenne',l:'Attention', c:'#B45309', bg:'#FFFBEB', b:'#FDE68A'},
          {p:'info',   l:'Info',      c:'#1D4ED8', bg:'#EFF6FF', b:'#BFDBFE'},
        ].map(s=>(
          <div key={s.p} style={{ borderRadius:'16px', padding:'20px', background:s.bg, border:`1px solid ${s.b}` }}>
            <div style={{ fontSize:'11px', fontWeight:700, textTransform:'uppercase', color:s.c, marginBottom:'6px' }}>{s.l}</div>
            <div style={{ fontSize:'42px', fontWeight:900, color:s.c, fontVariantNumeric:'tabular-nums', lineHeight:1 }}>{count(s.p)}</div>
          </div>
        ))}
      </div>

      {/* ── Filtres suggestions ── */}
      <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
        {[['all','Toutes'],['haute','🔴 Critique'],['moyenne','⚠️ Attention'],['info','💡 Info']].map(([p,l])=>(
          <button key={p} onClick={()=>setFilter(p)} style={{
            padding:'8px 16px', borderRadius:'10px', fontSize:'13px', fontWeight:600, cursor:'pointer',
            border: filter===p ? 'none' : '1px solid #E5E7EB',
            background: filter===p ? (p==='all'?'#1A2332':p==='haute'?'#BE123C':p==='moyenne'?'#B45309':'#1D4ED8') : 'white',
            color: filter===p ? 'white' : '#6B7280',
          }}>{l}{p!=='all'&&` (${count(p)})`}</button>
        ))}
      </div>

      {/* ── Suggestions automatiques ── */}
      {suggestions.length === 0 ? (
        <div style={{ background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:'16px', padding:'40px', textAlign:'center' }}>
          <div style={{ fontSize:'48px', marginBottom:'8px' }}>✅</div>
          <div style={{ fontWeight:700, color:'#166534', fontSize:'16px' }}>Aucune anomalie détectée</div>
          <div style={{ color:'#4ADE80', fontSize:'13px', marginTop:'4px' }}>{data?.message||'Les indicateurs sont dans les normes'}</div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          {suggestions.map((s,i) => {
            const cfg = PRIORITY[s.priorite]||PRIORITY.info;
            return (
              <div key={i} style={{ borderRadius:'16px', padding:'18px 20px', background:cfg.bg, border:`1px solid ${cfg.border}` }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:'14px' }}>
                  <span style={{ fontSize:'22px', marginTop:'2px' }}>{cfg.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px', flexWrap:'wrap' }}>
                      <span style={{ fontWeight:700, color:'#111827', fontSize:'15px' }}>{s.titre}</span>
                      <span style={{ fontSize:'11px', fontWeight:600, padding:'2px 8px', borderRadius:'20px', background:cfg.badge, color:cfg.badgeText }}>{cfg.label}</span>
                    </div>
                    <p style={{ fontSize:'13px', color:'#4B5563', marginBottom:'10px', lineHeight:'1.5' }}>{s.detail}</p>
                    {s.action && (
                      <div style={{ background:'rgba(255,255,255,0.65)', borderRadius:'10px', padding:'10px 14px' }}>
                        <div style={{ fontSize:'10px', color:'#9CA3AF', textTransform:'uppercase', fontWeight:600, marginBottom:'3px' }}>Action recommandée</div>
                        <div style={{ fontSize:'13px', fontWeight:500, color:'#374151' }}>{s.action}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Remarques ── */}
      <div style={{ background:'white', borderRadius:'16px', border:'1px solid #F1F5F9', overflow:'hidden', boxShadow:'0 1px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid #F1F5F9', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontWeight:700, fontSize:'16px', color:'#111827' }}>📝 Remarques & Observations</div>
            <div style={{ fontSize:'12px', color:'#9CA3AF', marginTop:'2px' }}>{remarques.filter(r=>r.statut==='ouvert').length} ouverte(s) · {remarques.filter(r=>r.statut==='resolu').length} résolue(s)</div>
          </div>
          <button onClick={()=>setModal('add')} style={{
            display:'flex', alignItems:'center', gap:'6px',
            padding:'9px 16px', border:'none', borderRadius:'10px',
            background:'linear-gradient(135deg,#004B8D,#0066CC)', color:'white',
            fontWeight:700, fontSize:'14px', cursor:'pointer',
          }}>
            <span style={{ fontSize:'18px', lineHeight:1 }}>+</span> Ajouter
          </button>
        </div>

        {remarques.length === 0 ? (
          <div style={{ padding:'40px', textAlign:'center', color:'#9CA3AF' }}>
            <div style={{ fontSize:'36px', marginBottom:'8px' }}>💬</div>
            <div style={{ fontSize:'14px', fontWeight:500 }}>Aucune remarque. Cliquez sur "+ Ajouter" pour commencer.</div>
          </div>
        ) : (
          <div>
            {remarques.map(rem => {
              const typeInfo = TYPES_REM.find(t=>t.v===rem.type)||TYPES_REM[0];
              const prioCfg = PRIORITY[rem.priorite]||PRIORITY.info;
              const resolu = rem.statut === 'resolu';
              return (
                <div key={rem.id} style={{
                  padding:'14px 20px', borderBottom:'1px solid #F9FAFB',
                  background: resolu ? '#F9FAFB' : 'white',
                  opacity: resolu ? 0.75 : 1,
                }}>
                  <div style={{ display:'flex', gap:'12px', alignItems:'flex-start' }}>
                    <span style={{ fontSize:'20px', marginTop:'1px' }}>{typeInfo.icon}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', gap:'8px', alignItems:'center', flexWrap:'wrap', marginBottom:'4px' }}>
                        <span style={{ fontSize:'11px', fontWeight:600, padding:'2px 8px', borderRadius:'20px', background:prioCfg.badge, color:prioCfg.badgeText }}>{prioCfg.label}</span>
                        <span style={{ fontSize:'11px', fontWeight:600, color:'#6B7280', background:'#F3F4F6', padding:'2px 8px', borderRadius:'20px' }}>{typeInfo.l}</span>
                        {rem.auteur && <span style={{ fontSize:'11px', color:'#9CA3AF' }}>👷 {rem.auteur}</span>}
                        <span style={{ fontSize:'10px', color:'#D1D5DB' }}>{fmtDate(rem.date)}</span>
                        {resolu && <span style={{ fontSize:'10px', fontWeight:600, color:'#16A34A', background:'#F0FDF4', padding:'2px 8px', borderRadius:'20px', border:'1px solid #BBF7D0' }}>✓ Résolu</span>}
                      </div>
                      <div style={{ fontSize:'14px', color: resolu ? '#9CA3AF' : '#1F2937', lineHeight:'1.5', textDecoration: resolu ? 'line-through' : 'none' }}>{rem.texte}</div>
                      {resolu && rem.dateResolu && (
                        <div style={{ fontSize:'10px', color:'#9CA3AF', marginTop:'2px' }}>Résolu le {fmtDate(rem.dateResolu)}</div>
                      )}
                    </div>
                    <div style={{ display:'flex', gap:'6px', flexShrink:0 }}>
                      <button onClick={()=>resolveRemarque(rem.id)} title={resolu?'Réouvrir':'Marquer résolu'} style={{
                        width:'30px', height:'30px', border:'none', borderRadius:'8px', cursor:'pointer',
                        background: resolu ? '#FEF3C7' : '#F0FDF4',
                        color: resolu ? '#B45309' : '#16A34A',
                        display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px',
                      }}>{resolu ? '↩' : '✓'}</button>
                      <button onClick={()=>deleteRemarque(rem.id)} title="Supprimer" style={{
                        width:'30px', height:'30px', border:'none', borderRadius:'8px', cursor:'pointer',
                        background:'#FEF2F2', color:'#EF4444',
                        display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px',
                      }}>🗑</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Bonnes pratiques ── */}
      <div style={{ background:'white', borderRadius:'16px', padding:'20px', border:'1px solid #F1F5F9', boxShadow:'0 1px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ fontWeight:700, color:'#111827', marginBottom:'16px', fontSize:'15px' }}>Bonnes Pratiques — Site BenGuerir</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
          {[
            'Maintenir un volume moyen ≥ 16 m³ par voyage phosphate',
            'Objectif production journalière phosphate : 4 000+ m³',
            'Taux de disponibilité cible : ≥ 85%',
            'Planifier la maintenance préventive en période basse',
            'Ratio stérile/phosphate à maintenir sous 0.6',
            "Saisir les arrêts dès qu'ils surviennent pour un suivi précis",
          ].map((tip,i)=>(
            <div key={i} style={{ display:'flex', gap:'10px', alignItems:'flex-start', padding:'10px 12px', background:'#F9FAFB', borderRadius:'10px' }}>
              <span style={{ width:'18px', height:'18px', borderRadius:'50%', background:'#DCFCE7', color:'#16A34A', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', fontWeight:700, flexShrink:0, marginTop:'1px' }}>✓</span>
              <span style={{ fontSize:'13px', color:'#4B5563', lineHeight:'1.5' }}>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Modal ajout remarque ── */}
      {modal === 'add' && (
        <div style={{ position:'fixed', inset:0, zIndex:50, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}
          onClick={e => { if(e.target===e.currentTarget) setModal(null); }}>
          <div style={{ background:'white', borderRadius:'16px', width:'100%', maxWidth:'520px', boxShadow:'0 20px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid #F1F5F9', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontWeight:700, fontSize:'16px', color:'#111827' }}>Ajouter une remarque</div>
              <button onClick={()=>setModal(null)} style={{ width:'30px', height:'30px', border:'none', borderRadius:'8px', background:'#F3F4F6', cursor:'pointer', fontSize:'16px', color:'#6B7280' }}>✕</button>
            </div>
            <div style={{ padding:'20px', display:'flex', flexDirection:'column', gap:'14px' }}>
              
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                <div>
                  <div style={{ fontSize:'11px', fontWeight:700, color:'#6B7280', textTransform:'uppercase', marginBottom:'6px' }}>Type</div>
                  <select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} style={inpStyle}>
                    {TYPES_REM.map(t=><option key={t.v} value={t.v}>{t.icon} {t.l}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize:'11px', fontWeight:700, color:'#6B7280', textTransform:'uppercase', marginBottom:'6px' }}>Priorité</div>
                  <select value={form.priorite} onChange={e=>setForm(p=>({...p,priorite:e.target.value}))} style={inpStyle}>
                    <option value="info">💡 Info</option>
                    <option value="moyenne">⚠️ Attention</option>
                    <option value="haute">🔴 Critique</option>
                  </select>
                </div>
              </div>

              <div>
                <div style={{ fontSize:'11px', fontWeight:700, color:'#6B7280', textTransform:'uppercase', marginBottom:'6px' }}>Auteur (optionnel)</div>
                <input value={form.auteur} onChange={e=>setForm(p=>({...p,auteur:e.target.value}))}
                  placeholder="Nom du superviseur / technicien" style={inpStyle}/>
              </div>

              <div>
                <div style={{ fontSize:'11px', fontWeight:700, color:'#6B7280', textTransform:'uppercase', marginBottom:'6px' }}>Remarque *</div>
                <textarea value={form.texte} onChange={e=>setForm(p=>({...p,texte:e.target.value}))}
                  rows={4} placeholder="Décrivez l'observation, l'anomalie ou la recommandation…"
                  style={{ ...inpStyle, resize:'vertical', minHeight:'100px', lineHeight:'1.5' }}/>
              </div>
            </div>
            <div style={{ padding:'14px 20px', borderTop:'1px solid #F1F5F9', display:'flex', gap:'10px', justifyContent:'flex-end' }}>
              <button onClick={()=>setModal(null)} style={{ padding:'9px 18px', border:'none', borderRadius:'10px', background:'#F3F4F6', color:'#374151', fontWeight:600, fontSize:'14px', cursor:'pointer' }}>Annuler</button>
              <button onClick={addRemarque} disabled={!form.texte.trim()} style={{ padding:'9px 22px', border:'none', borderRadius:'10px', background:'linear-gradient(135deg,#004B8D,#0066CC)', color:'white', fontWeight:700, fontSize:'14px', cursor:'pointer', opacity:!form.texte.trim()?0.5:1 }}>
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
