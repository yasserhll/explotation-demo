import { useState, useEffect } from 'react';
import { rotationAPI } from '../services/api';

const PANNEAUX = [
  'TG3 2EME SORTIE P7 / DECHARGE','TG3 P7 1ER SORTIE / DECHARGE','TG3 P7 / DECHARGE',
  'TF8 INT 3/4 P5 / DECHARGE','TF8 P5 3/4 / DECHARGE','TF8 C4 P5 / CRIBLAGE MOBILE',
  'TF8 P5 / CRIBLAGE MOBILE','TF8 P5 / DECHARGE','TE9 P5 / DECHARGE',
  'TG4 P7 / TREMIE 1','TG4 P7 / STOCK GOUDRON','TG4 P7 / STOCK BASCULE',
  'TJ9 P6 / CRIBLAGE MOBILE','TJ9 P6 / STOCK PSF',
  'T39 P2 / DECHARGE','T43 P2 / DECHARGE','REPRISE PSF / CRIBLAGE MOBILE',
];

const cleanDate = (val) => val ? String(val).slice(0, 10) : '';
const getToday = () => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`;
};
const fmt = n => Number(n||0).toLocaleString('fr-FR');
const labelDate = (d) => {
  if (!d) return '';
  try { return new Date(d+'T12:00:00').toLocaleDateString('fr-FR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'}); }
  catch { return d; }
};
const pillDate = (d) => {
  if (!d) return '';
  try { return new Date(cleanDate(d)+'T12:00:00').toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'}); }
  catch { return d; }
};

// ─── Styles inline ────────────────────────────────────────────────────────────
const inp = { width:'100%', border:'1px solid #E5E7EB', borderRadius:'8px', background:'#F9FAFB', padding:'7px 10px', fontSize:'13px', outline:'none', boxSizing:'border-box' };
const inpSm = { width:'100%', border:'1px solid #E5E7EB', borderRadius:'8px', background:'#F9FAFB', padding:'7px 6px', fontSize:'13px', outline:'none', boxSizing:'border-box', textAlign:'center' };

// ─── Ligne panneau/km/vgs (non-contrôlé pour km et vgs) ─────────────────────
function PRow({ pan, km, vgs, onPan, onKm, onVgs, label, color }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 72px 72px', gap:'6px', alignItems:'center' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
        <span style={{ fontSize:'10px', fontWeight:700, color, whiteSpace:'nowrap', minWidth:'14px' }}>{label}</span>
        <input list="pl" value={pan} onChange={e => onPan(e.target.value)}
          placeholder="Panneau / Destination" style={inp} autoComplete="off"/>
      </div>
      <input type="text" inputMode="decimal"
        defaultValue={km} key={'km_'+km}
        onBlur={e => onKm(e.target.value.replace(',','.') || '')}
        placeholder="km" style={inpSm}/>
      <input type="text" inputMode="numeric"
        defaultValue={vgs} key={'vgs_'+vgs}
        onBlur={e => onVgs(e.target.value || '')}
        placeholder="Vgs" style={inpSm}/>
    </div>
  );
}

// ─── Section poste (2 lignes panneau A + B) ──────────────────────────────────
function PosteSection({ title, color, fields, vals, onChange }) {
  // fields = ['sterile_p1a', 'sterile_p1b']
  const [fa, fb] = fields;
  return (
    <div style={{ border:`1px solid ${color}40`, borderRadius:'10px', padding:'10px 12px', background:`${color}08` }}>
      <div style={{ fontSize:'11px', fontWeight:700, color, textTransform:'uppercase', marginBottom:'6px' }}>{title}</div>
      {/* En-têtes colonnes */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 72px 72px', gap:'6px', marginBottom:'4px' }}>
        <div style={{ fontSize:'10px', color:'#9CA3AF', fontWeight:600, paddingLeft:'20px' }}>Panneau / Destination</div>
        <div style={{ fontSize:'10px', color:'#9CA3AF', fontWeight:600, textAlign:'center' }}>km</div>
        <div style={{ fontSize:'10px', color:'#9CA3AF', fontWeight:600, textAlign:'center' }}>Vgs</div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
        <PRow label="A" color={color}
          pan={vals[fa+'_panneau']||''} km={vals[fa+'_km']||''} vgs={vals[fa+'_vgs']||''}
          onPan={v => onChange(fa+'_panneau', v)}
          onKm={v  => onChange(fa+'_km', v)}
          onVgs={v => onChange(fa+'_vgs', v)}/>
        <PRow label="B" color={color}
          pan={vals[fb+'_panneau']||''} km={vals[fb+'_km']||''} vgs={vals[fb+'_vgs']||''}
          onPan={v => onChange(fb+'_panneau', v)}
          onKm={v  => onChange(fb+'_km', v)}
          onVgs={v => onChange(fb+'_vgs', v)}/>
      </div>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function RotationModal({ date, row, affectations, existingCamions, onSave, onClose }) {
  const isEdit = !!row?.id;
  const dispo  = affectations.filter(a => isEdit ? true : !existingCamions.includes(a.camion_code));

  const initCamion = row?.camion_id || dispo[0]?.camion_code || '';

  // Tous les champs dans un seul objet state pour simplifier
  const initVals = (r) => {
    const fields = [
      'sterile_p1a','sterile_p1b','phosphate_p1a','phosphate_p1b',
      'sterile_p2a','sterile_p2b','phosphate_p2a','phosphate_p2b',
    ];
    const v = {};
    fields.forEach(f => {
      v[f+'_panneau'] = r?.[f+'_panneau'] || '';
      v[f+'_km']      = r?.[f+'_km'] != null ? r[f+'_km'] : '';
      v[f+'_vgs']     = r?.[f+'_vgs'] != null ? r[f+'_vgs'] : '';
    });
    return v;
  };

  const [camion,  setCamion]  = useState(initCamion);
  const [ch1,     setCh1]     = useState(row?.chauffeur_1er || '');
  const [ch2,     setCh2]     = useState(row?.chauffeur_2e  || '');
  const [vals,    setVals]    = useState(initVals(row));
  const [comm,    setComm]    = useState(row?.commentaires  || '');
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState('');

  const change = (field, value) => setVals(prev => ({ ...prev, [field]: value }));

  const changeCamion = code => {
    setCamion(code);
    const a = affectations.find(x => x.camion_code === code);
    if (a) { setCh1(a.chauffeur_principal||''); setCh2(a.chauffeur_secondaire||''); }
  };

  useEffect(() => {
    if (!row && initCamion) {
      const a = affectations.find(x => x.camion_code === initCamion);
      if (a) { setCh1(a.chauffeur_principal||''); setCh2(a.chauffeur_secondaire||''); }
    }
  }, []);

  const submit = async () => {
    if (!camion) { setErr('Sélectionnez un camion.'); return; }
    setSaving(true); setErr('');
    try {
      const n = v => (v !== '' && v != null) ? v : null;
      const payload = { date, camion_id: camion, chauffeur_1er: n(ch1), chauffeur_2e: n(ch2), commentaires: n(comm) };
      Object.keys(vals).forEach(k => { payload[k] = n(vals[k]); });
      if (isEdit) await rotationAPI.update(row.id, payload);
      else        await rotationAPI.create(payload);
      onSave();
    } catch(e) { setErr(e.response?.data?.message || 'Erreur.'); }
    setSaving(false);
  };

  const SECTIONS = [
    { title:'🟡 Stérile — Poste 1',   color:'#D97706', fields:['sterile_p1a',   'sterile_p1b']   },
    { title:'🔵 Phosphate — Poste 1', color:'#2563EB', fields:['phosphate_p1a', 'phosphate_p1b'] },
    { title:'🟠 Stérile — Poste 2',   color:'#B45309', fields:['sterile_p2a',   'sterile_p2b']   },
    { title:'🟦 Phosphate — Poste 2', color:'#1D4ED8', fields:['phosphate_p2a', 'phosphate_p2b'] },
  ];

  return (
    <div style={{ position:'fixed', inset:0, zIndex:50, background:'rgba(0,0,0,0.55)', overflowY:'auto', padding:'20px 0' }}>
      <div style={{ background:'white', borderRadius:'16px', width:'100%', maxWidth:'680px', margin:'0 auto', boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}>

        {/* Header */}
        <div style={{ padding:'16px 24px', borderBottom:'1px solid #F1F5F9', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontWeight:700, fontSize:'16px', color:'#111827' }}>{isEdit ? 'Modifier la rotation' : 'Ajouter une rotation'}</div>
            <div style={{ fontSize:'12px', color:'#9CA3AF', marginTop:'2px' }}>📅 {date}</div>
          </div>
          <button onClick={onClose} style={{ width:'32px', height:'32px', border:'none', borderRadius:'10px', background:'#F3F4F6', cursor:'pointer', fontSize:'16px', color:'#6B7280' }}>✕</button>
        </div>

        {/* Corps */}
        <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:'14px' }}>

          {err && <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', color:'#DC2626', padding:'8px 12px', borderRadius:'8px', fontSize:'13px' }}>{err}</div>}

          {/* Camion + Chauffeurs */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            <div>
              <div style={{ fontSize:'11px', fontWeight:700, color:'#6B7280', textTransform:'uppercase', marginBottom:'6px' }}>Camion *</div>
              {isEdit ? (
                <div style={{ fontWeight:900, color:'#1D4ED8', fontFamily:'monospace', fontSize:'20px', padding:'8px', background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:'10px', textAlign:'center' }}>{camion}</div>
              ) : dispo.length > 0 ? (
                <select value={camion} onChange={e => changeCamion(e.target.value)} style={inp}>
                  <option value="">— Choisir —</option>
                  {dispo.map(a => <option key={a.camion_code} value={a.camion_code}>{a.camion_code}</option>)}
                </select>
              ) : (
                <input value={camion} onChange={e => setCamion(e.target.value.toUpperCase())} style={{ ...inp, fontFamily:'monospace', fontWeight:700 }} placeholder="Ex: D183"/>
              )}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              <div>
                <div style={{ fontSize:'11px', fontWeight:700, color:'#6B7280', textTransform:'uppercase', marginBottom:'4px' }}>Chauffeur 1er Poste</div>
                <input value={ch1} onChange={e => setCh1(e.target.value)} style={inp} placeholder="Nom"/>
              </div>
              <div>
                <div style={{ fontSize:'11px', fontWeight:700, color:'#6B7280', textTransform:'uppercase', marginBottom:'4px' }}>Chauffeur 2e Poste</div>
                <input value={ch2} onChange={e => setCh2(e.target.value)} style={inp} placeholder="Nom"/>
              </div>
            </div>
          </div>

          {/* 4 sections x 2 panneaux */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            {SECTIONS.map(s => (
              <PosteSection key={s.title} title={s.title} color={s.color} fields={s.fields} vals={vals} onChange={change}/>
            ))}
          </div>

          {/* Commentaires */}
          <div>
            <div style={{ fontSize:'11px', fontWeight:700, color:'#6B7280', textTransform:'uppercase', marginBottom:'6px' }}>Commentaires</div>
            <textarea value={comm} onChange={e => setComm(e.target.value)}
              rows={2} placeholder="Observations, incidents…"
              style={{ ...inp, resize:'vertical', minHeight:'60px' }}/>
          </div>

        </div>

        {/* Footer */}
        <div style={{ padding:'14px 24px', borderTop:'1px solid #F1F5F9', display:'flex', gap:'10px', justifyContent:'flex-end' }}>
          <button onClick={onClose} style={{ padding:'9px 18px', border:'none', borderRadius:'10px', background:'#F3F4F6', color:'#374151', fontWeight:600, fontSize:'14px', cursor:'pointer' }}>Annuler</button>
          <button onClick={submit} disabled={saving} style={{ padding:'9px 22px', border:'none', borderRadius:'10px', background:'linear-gradient(135deg,#004B8D,#0066CC)', color:'white', fontWeight:700, fontSize:'14px', cursor:'pointer', opacity:saving?0.6:1 }}>
            {saving ? 'Sauvegarde…' : isEdit ? 'Modifier' : 'Ajouter'}
          </button>
        </div>
      </div>
      <datalist id="pl">{PANNEAUX.map(v => <option key={v} value={v}/>)}</datalist>
    </div>
  );
}

// ─── Cellule voyages ──────────────────────────────────────────────────────────
const Vgs = ({v, color}) => (v || v===0)
  ? <span style={{ fontWeight:700, color, fontVariantNumeric:'tabular-nums' }}>{v}</span>
  : <span style={{ color:'#E5E7EB', fontSize:'11px' }}>—</span>;

// ─── Cellule poste : 1 seule <td>, tableau interne aligné ───────────────────
function PanneauCell({ pa, ka, va, pb, kb, vb, color, bg }) {
  const has = (pan, km, vgs) => pan || km || (vgs !== null && vgs !== undefined && vgs !== '');
  const hasA = has(pa, ka, va);
  const hasB = has(pb, kb, vb);
  const short = v => v ? v.split('/')[0].trim() : '—';
  const val   = v => (v !== null && v !== undefined && v !== '') ? v : '—';

  if (!hasA && !hasB) return (
    <td style={{padding:'0 16px', background:bg, borderLeft:`3px solid ${color}20`, textAlign:'center', color:'#CBD5E1', fontSize:'13px'}}>—</td>
  );

  return (
    <td style={{padding:'8px 12px', background:bg, borderLeft:`3px solid ${color}`}}>
      <table style={{borderCollapse:'collapse', width:'100%'}}>
        <tbody>
          {hasA && (
            <tr>
              <td style={{paddingRight:'6px', width:'20px'}}>
                <span style={{fontSize:'9px',fontWeight:900,color:'white',background:color,borderRadius:'3px',padding:'1px 5px',whiteSpace:'nowrap'}}>A</span>
              </td>
              <td style={{fontSize:'11px',color:'#374151',whiteSpace:'nowrap',maxWidth:'110px',overflow:'hidden',textOverflow:'ellipsis',paddingRight:'8px'}} title={pa||''}>{short(pa)}</td>
              <td style={{fontSize:'11px',color:'#94A3B8',whiteSpace:'nowrap',textAlign:'right',paddingRight:'10px',width:'52px'}}>{ka ? ka+' km' : ''}</td>
              <td style={{fontSize:'13px',fontWeight:900,color:val(va)!=='—'?color:'#CBD5E1',textAlign:'right',width:'28px'}}>{val(va)}</td>
            </tr>
          )}
          {hasA && hasB && (
            <tr><td colSpan={4} style={{padding:'3px 0'}}><div style={{borderTop:`1px dashed ${color}30`}}/></td></tr>
          )}
          {hasB && (
            <tr>
              <td style={{paddingRight:'6px', width:'20px'}}>
                <span style={{fontSize:'9px',fontWeight:900,color:color,background:color+'20',borderRadius:'3px',padding:'1px 5px',whiteSpace:'nowrap',border:`1px solid ${color}40`}}>B</span>
              </td>
              <td style={{fontSize:'11px',color:'#374151',whiteSpace:'nowrap',maxWidth:'110px',overflow:'hidden',textOverflow:'ellipsis',paddingRight:'8px'}} title={pb||''}>{short(pb)}</td>
              <td style={{fontSize:'11px',color:'#94A3B8',whiteSpace:'nowrap',textAlign:'right',paddingRight:'10px',width:'52px'}}>{kb ? kb+' km' : ''}</td>
              <td style={{fontSize:'13px',fontWeight:900,color:val(vb)!=='—'?color:'#CBD5E1',textAlign:'right',width:'28px'}}>{val(vb)}</td>
            </tr>
          )}
        </tbody>
      </table>
    </td>
  );
}

function RotRow({ r, onEdit, onDelete, deleting, idx }) {
  const total = (r.sterile_p1a_vgs||0)+(r.sterile_p1b_vgs||0)
              + (r.phosphate_p1a_vgs||0)+(r.phosphate_p1b_vgs||0)
              + (r.sterile_p2a_vgs||0)+(r.sterile_p2b_vgs||0)
              + (r.phosphate_p2a_vgs||0)+(r.phosphate_p2b_vgs||0);
  const rowBg = idx % 2 === 0 ? '#FFFFFF' : '#FAFBFD';

  return (
    <tr style={{background:rowBg, borderBottom:'1px solid #F1F5F9'}}
      onMouseEnter={e => e.currentTarget.style.background='#EFF6FF'}
      onMouseLeave={e => e.currentTarget.style.background=rowBg}>

      <td style={{padding:'10px 12px', whiteSpace:'nowrap', fontWeight:900, color:'#1D4ED8', fontFamily:'monospace', fontSize:'13px', borderRight:'1px solid #E2E8F0'}}>{r.camion_id}</td>
      <td style={{padding:'10px 10px', fontSize:'12px', color:'#1F2937', whiteSpace:'nowrap'}}>{r.chauffeur_1er||<span style={{color:'#CBD5E1'}}>—</span>}</td>
      <td style={{padding:'10px 10px', fontSize:'12px', color:'#6B7280', whiteSpace:'nowrap', borderRight:'2px solid #CBD5E1'}}>{r.chauffeur_2e||<span style={{color:'#CBD5E1'}}>—</span>}</td>

      <PanneauCell pa={r.sterile_p1a_panneau}   ka={r.sterile_p1a_km}   va={r.sterile_p1a_vgs}
                   pb={r.sterile_p1b_panneau}   kb={r.sterile_p1b_km}   vb={r.sterile_p1b_vgs}   color="#D97706" bg={idx%2===0?'#FFFDF5':'#FFFBEB'}/>
      <PanneauCell pa={r.phosphate_p1a_panneau} ka={r.phosphate_p1a_km} va={r.phosphate_p1a_vgs}
                   pb={r.phosphate_p1b_panneau} kb={r.phosphate_p1b_km} vb={r.phosphate_p1b_vgs} color="#1D4ED8" bg={idx%2===0?'#F8FBFF':'#EFF6FF'}/>
      <PanneauCell pa={r.sterile_p2a_panneau}   ka={r.sterile_p2a_km}   va={r.sterile_p2a_vgs}
                   pb={r.sterile_p2b_panneau}   kb={r.sterile_p2b_km}   vb={r.sterile_p2b_vgs}   color="#B45309" bg={idx%2===0?'#FFFDF5':'#FEF3C7'}/>
      <PanneauCell pa={r.phosphate_p2a_panneau} ka={r.phosphate_p2a_km} va={r.phosphate_p2a_vgs}
                   pb={r.phosphate_p2b_panneau} kb={r.phosphate_p2b_km} vb={r.phosphate_p2b_vgs} color="#1E40AF" bg={idx%2===0?'#F8F8FF':'#EEF2FF'}/>

      <td style={{padding:'10px 12px', textAlign:'center', fontWeight:900, fontSize:'15px',
        color: total ? '#111827' : '#CBD5E1',
        borderLeft:'2px solid #E2E8F0',
        background: total ? (idx%2===0?'#F8FAFC':'#F1F5F9') : rowBg}}>
        {total || '—'}
      </td>
      <td style={{padding:'10px 10px', fontSize:'11px', color:'#9CA3AF', maxWidth:'120px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}} title={r.commentaires||''}>
        {r.commentaires || ''}
      </td>
      <td style={{padding:'10px 12px', textAlign:'center'}}>
        <div style={{display:'inline-flex', gap:'5px'}}>
          <button onClick={() => onEdit(r)} title="Modifier" style={{width:'30px',height:'30px',border:'1px solid #BFDBFE',borderRadius:'7px',background:'#EFF6FF',color:'#2563EB',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}
            onMouseEnter={e=>{e.currentTarget.style.background='#2563EB';e.currentTarget.style.color='white';}}
            onMouseLeave={e=>{e.currentTarget.style.background='#EFF6FF';e.currentTarget.style.color='#2563EB';}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/></svg>
          </button>
          <button onClick={() => onDelete(r.id)} disabled={deleting===r.id} title="Supprimer" style={{width:'30px',height:'30px',border:'1px solid #FECACA',borderRadius:'7px',background:'#FEF2F2',color:'#EF4444',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',opacity:deleting===r.id?0.4:1}}
            onMouseEnter={e=>{if(deleting!==r.id){e.currentTarget.style.background='#EF4444';e.currentTarget.style.color='white';}}}
            onMouseLeave={e=>{e.currentTarget.style.background='#FEF2F2';e.currentTarget.style.color='#EF4444';}}>
            {deleting===r.id
              ? <div style={{width:'11px',height:'11px',border:'2px solid #EF4444',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.6s linear infinite'}}/>
              : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
            }
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Page principale ───────────────────────────────────────────────────────────
export default function RotationChauffeurs() {
  const [date,         setDate]         = useState(getToday());
  const [rotations,    setRotations]    = useState([]);
  const [affectations, setAffectations] = useState([]);
  const [datesExist,   setDatesExist]   = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [modal,        setModal]        = useState(null);
  const [deleting,     setDeleting]     = useState(null);
  const [msg,          setMsg]          = useState(null);

  const flash = (text, ok=true) => { setMsg({text,ok}); setTimeout(()=>setMsg(null),3000); };
  const loadDates = () => rotationAPI.getDates().then(r=>setDatesExist(r.data||[])).catch(()=>{});
  const load = (d) => {
    setLoading(true);
    rotationAPI.getByDate(d)
      .then(r => { setRotations((r.data.rotations||[]).map(row=>({...row,date:cleanDate(row.date)}))); setAffectations(r.data.affectations||[]); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadDates(); }, []);
  useEffect(() => { load(date); }, [date]);

  const handleSaved = () => { setModal(null); load(date); loadDates(); flash('✓ Rotation sauvegardée'); };
  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette rotation ?')) return;
    setDeleting(id);
    try { await rotationAPI.delete(id); setRotations(p=>p.filter(r=>r.id!==id)); loadDates(); flash('✓ Supprimé'); }
    catch { flash('Erreur suppression', false); }
    setDeleting(null);
  };

  // Totaux
  const totPhos = rotations.reduce((a,r) => a+(r.phosphate_p1a_vgs||0)+(r.phosphate_p1b_vgs||0)+(r.phosphate_p2a_vgs||0)+(r.phosphate_p2b_vgs||0), 0);
  const totSter = rotations.reduce((a,r) => a+(r.sterile_p1a_vgs||0)+(r.sterile_p1b_vgs||0)+(r.sterile_p2a_vgs||0)+(r.sterile_p2b_vgs||0), 0);
  const totalVoy = totPhos + totSter;
  const volPhos  = totPhos * 16;
  const volSter  = totSter * 14;
  const existingCamions = rotations.map(r=>r.camion_id);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>

      {msg && (
        <div style={{ position:'fixed', top:'16px', right:'16px', zIndex:100, padding:'12px 18px', borderRadius:'12px', fontWeight:600, fontSize:'14px', boxShadow:'0 4px 20px rgba(0,0,0,0.15)', background:msg.ok?'#F0FDF4':'#FEF2F2', border:`1px solid ${msg.ok?'#86EFAC':'#FECACA'}`, color:msg.ok?'#166534':'#DC2626' }}>{msg.text}</div>
      )}

      {/* Header */}
      <div style={{ background:'white', borderRadius:'16px', border:'1px solid #F1F5F9', padding:'16px 20px', boxShadow:'0 1px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ display:'flex', flexWrap:'wrap', gap:'12px', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontWeight:700, fontSize:'16px', color:'#111827' }}>Rotation des Chauffeurs</div>
            <div style={{ fontSize:'12px', color:'#9CA3AF', marginTop:'2px', textTransform:'capitalize' }}>{labelDate(date)}</div>
          </div>
          <div style={{ display:'flex', gap:'8px', alignItems:'center', flexWrap:'wrap' }}>
            <button onClick={()=>setDate(getToday())} style={{ padding:'8px 14px', borderRadius:'10px', fontWeight:600, fontSize:'13px', cursor:'pointer', border:date===getToday()?'none':'1px solid #E5E7EB', background:date===getToday()?'#2563EB':'#F9FAFB', color:date===getToday()?'white':'#374151' }}>Aujourd'hui</button>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{ border:'1px solid #E5E7EB', borderRadius:'10px', padding:'8px 12px', fontSize:'13px', background:'#F9FAFB', outline:'none' }}/>
            <button onClick={()=>setModal({row:null})} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'9px 16px', borderRadius:'10px', fontWeight:700, fontSize:'14px', border:'none', background:'linear-gradient(135deg,#004B8D,#0066CC)', color:'white', cursor:'pointer' }}>
              <span style={{ fontSize:'18px', lineHeight:1 }}>+</span> Ajouter
            </button>
          </div>
        </div>
        {datesExist.length > 0 && (
          <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginTop:'12px', paddingTop:'12px', borderTop:'1px solid #F9FAFB', alignItems:'center' }}>
            <span style={{ fontSize:'12px', color:'#9CA3AF', fontWeight:500 }}>Jours saisis :</span>
            {datesExist.slice(0,10).map(d=>(
              <button key={d.date} onClick={()=>setDate(cleanDate(d.date))} style={{ padding:'4px 10px', borderRadius:'8px', fontWeight:600, fontSize:'12px', cursor:'pointer', border:'none', background:cleanDate(d.date)===date?'#2563EB':'#EFF6FF', color:cleanDate(d.date)===date?'white':'#1D4ED8' }}>
                {pillDate(d.date)} <span style={{opacity:0.6}}>·{d.nb_camions}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* KPIs */}
      {rotations.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'12px' }}>
          {[
            {l:'Camions',      v:rotations.length,          c:'#004B8D',bg:'#EFF6FF',b:'#BFDBFE'},
            {l:'Phosphate m³', v:fmt(volPhos)+' m³',        c:'#1D4ED8',bg:'#DBEAFE',b:'#93C5FD'},
            {l:'Stérile m³',  v:fmt(volSter)+' m³',        c:'#B45309',bg:'#FEF3C7',b:'#FDE68A'},
            {l:'Total voyages',v:fmt(totalVoy),              c:'#7C3AED',bg:'#F5F3FF',b:'#DDD6FE'},
            {l:'m³ total',    v:fmt(volPhos+volSter)+' m³', c:'#00843D',bg:'#F0FDF4',b:'#BBF7D0'},
          ].map((s,i)=>(
            <div key={i} style={{ borderRadius:'14px', padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', background:s.bg, border:`1px solid ${s.b}` }}>
              <span style={{ fontSize:'12px', fontWeight:600, color:s.c }}>{s.l}</span>
              <span style={{ fontSize:'18px', fontWeight:900, color:s.c }}>{s.v}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tableau */}
      <div style={{ background:'white', borderRadius:'16px', border:'1px solid #F1F5F9', overflow:'hidden', boxShadow:'0 1px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ padding:'12px 20px', borderBottom:'1px solid #F1F5F9', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontWeight:600, fontSize:'14px', color:'#374151' }}>
            {loading ? 'Chargement…' : rotations.length > 0 ? `${rotations.length} camion(s) · ${fmt(totalVoy)} voyages` : 'Aucune rotation saisie pour cette date'}
          </span>
          {rotations.length > 0 && (
            <button onClick={()=>setModal({row:null})} style={{ padding:'6px 14px', borderRadius:'8px', fontWeight:600, fontSize:'12px', cursor:'pointer', border:'1px solid #BFDBFE', background:'#EFF6FF', color:'#1D4ED8' }}>+ Camion</button>
          )}
        </div>

        {loading ? (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'60px', color:'#9CA3AF' }}>
            <div style={{ width:'20px', height:'20px', border:'2px solid #3B82F6', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite', marginRight:'8px' }}/>
            Chargement…
          </div>
        ) : rotations.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px' }}>
            <div style={{ fontSize:'48px', marginBottom:'12px' }}>📋</div>
            <div style={{ fontWeight:600, color:'#6B7280', marginBottom:'4px' }}>Aucune rotation pour {labelDate(date)||'cette date'}</div>
            <div style={{ fontSize:'13px', color:'#9CA3AF', marginBottom:'20px' }}>Cliquez sur "+ Ajouter" pour commencer</div>
            <button onClick={()=>setModal({row:null})} style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'10px 22px', borderRadius:'12px', fontWeight:700, fontSize:'14px', border:'none', background:'linear-gradient(135deg,#004B8D,#0066CC)', color:'white', cursor:'pointer' }}>
              + Ajouter un camion
            </button>
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
              <thead>
                <tr style={{background:'#0D2B4E'}}>
                  <th colSpan={3} style={{padding:'9px 12px', color:'#64748B', fontSize:'10px', fontWeight:600, borderRight:'2px solid #1E3A5F'}}> </th>
                  <th style={{padding:'9px 14px', textAlign:'center', fontSize:'11px', fontWeight:800, color:'#FDE68A', background:'#1A1500', borderLeft:'3px solid #D97706', whiteSpace:'nowrap'}}>🟡 Stérile P1</th>
                  <th style={{padding:'9px 14px', textAlign:'center', fontSize:'11px', fontWeight:800, color:'#93C5FD', background:'#080F1E', borderLeft:'3px solid #1D4ED8', whiteSpace:'nowrap'}}>🔵 Phosphate P1</th>
                  <th style={{padding:'9px 14px', textAlign:'center', fontSize:'11px', fontWeight:800, color:'#FCA5A5', background:'#1A0800', borderLeft:'3px solid #B45309', whiteSpace:'nowrap'}}>🟠 Stérile P2</th>
                  <th style={{padding:'9px 14px', textAlign:'center', fontSize:'11px', fontWeight:800, color:'#A5B4FC', background:'#06060F', borderLeft:'3px solid #1E40AF', whiteSpace:'nowrap'}}>🟦 Phosphate P2</th>
                  <th colSpan={3} style={{padding:'9px 12px', color:'#64748B', fontSize:'10px', borderLeft:'2px solid #334155'}}> </th>
                </tr>
                <tr style={{background:'#F8FAFC', borderBottom:'2px solid #CBD5E1'}}>
                  <th style={{padding:'9px 12px', textAlign:'left', fontSize:'11px', fontWeight:700, color:'#374151', textTransform:'uppercase', whiteSpace:'nowrap', borderRight:'1px solid #E2E8F0'}}>Camion</th>
                  <th style={{padding:'9px 10px', textAlign:'left', fontSize:'11px', fontWeight:700, color:'#374151', textTransform:'uppercase', whiteSpace:'nowrap'}}>Chauffeur 1er</th>
                  <th style={{padding:'9px 10px', textAlign:'left', fontSize:'11px', fontWeight:700, color:'#374151', textTransform:'uppercase', whiteSpace:'nowrap', borderRight:'2px solid #CBD5E1'}}>Chauffeur 2e</th>
                  <th style={{padding:'9px 14px', textAlign:'left', fontSize:'10px', fontWeight:700, color:'#D97706', textTransform:'uppercase', background:'#FFFBEB', borderLeft:'3px solid #D97706', whiteSpace:'nowrap'}}>Panneau · km · Vgs</th>
                  <th style={{padding:'9px 14px', textAlign:'left', fontSize:'10px', fontWeight:700, color:'#1D4ED8', textTransform:'uppercase', background:'#EFF6FF', borderLeft:'3px solid #1D4ED8', whiteSpace:'nowrap'}}>Panneau · km · Vgs</th>
                  <th style={{padding:'9px 14px', textAlign:'left', fontSize:'10px', fontWeight:700, color:'#B45309', textTransform:'uppercase', background:'#FEF3C7', borderLeft:'3px solid #B45309', whiteSpace:'nowrap'}}>Panneau · km · Vgs</th>
                  <th style={{padding:'9px 14px', textAlign:'left', fontSize:'10px', fontWeight:700, color:'#1E40AF', textTransform:'uppercase', background:'#EEF2FF', borderLeft:'3px solid #1E40AF', whiteSpace:'nowrap'}}>Panneau · km · Vgs</th>
                  <th style={{padding:'9px 12px', textAlign:'center', fontSize:'11px', fontWeight:700, color:'#374151', textTransform:'uppercase', borderLeft:'2px solid #E2E8F0', whiteSpace:'nowrap'}}>Total</th>
                  <th style={{padding:'9px 10px', textAlign:'left',   fontSize:'11px', fontWeight:700, color:'#9CA3AF', textTransform:'uppercase'}}>Note</th>
                  <th style={{padding:'9px 12px', textAlign:'center', fontSize:'11px', fontWeight:700, color:'#9CA3AF', textTransform:'uppercase'}}>Actions</th>
                </tr>
              </thead>
              <tfoot>
                <tr style={{background:'#1A2332'}}>
                  <td colSpan={3} style={{padding:'11px 12px', color:'white', fontWeight:700, fontSize:'13px', borderRight:'2px solid #334155'}}>
                    TOTAL — {rotations.length} camion(s)
                  </td>
                  {/* Stérile P1 */}
                  <td style={{padding:'11px 14px', background:'#1A1500', borderLeft:'3px solid #D97706'}}>
                    <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
                      <span style={{fontSize:'10px',color:'#FDE68A99',fontWeight:600}}>A</span>
                      <span style={{fontWeight:900,color:'#FDE68A',fontSize:'14px'}}>{rotations.reduce((a,r)=>a+(r.sterile_p1a_vgs||0),0)||'—'}</span>
                      <span style={{fontSize:'10px',color:'#FDE68A60',margin:'0 2px'}}>·</span>
                      <span style={{fontSize:'10px',color:'#FDE68A99',fontWeight:600}}>B</span>
                      <span style={{fontWeight:900,color:'#FDE68A80',fontSize:'14px'}}>{rotations.reduce((a,r)=>a+(r.sterile_p1b_vgs||0),0)||'—'}</span>
                    </div>
                  </td>
                  {/* Phosphate P1 */}
                  <td style={{padding:'11px 14px', background:'#080F1E', borderLeft:'3px solid #1D4ED8'}}>
                    <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
                      <span style={{fontSize:'10px',color:'#93C5FD99',fontWeight:600}}>A</span>
                      <span style={{fontWeight:900,color:'#93C5FD',fontSize:'14px'}}>{rotations.reduce((a,r)=>a+(r.phosphate_p1a_vgs||0),0)||'—'}</span>
                      <span style={{fontSize:'10px',color:'#93C5FD60',margin:'0 2px'}}>·</span>
                      <span style={{fontSize:'10px',color:'#93C5FD99',fontWeight:600}}>B</span>
                      <span style={{fontWeight:900,color:'#93C5FD80',fontSize:'14px'}}>{rotations.reduce((a,r)=>a+(r.phosphate_p1b_vgs||0),0)||'—'}</span>
                    </div>
                  </td>
                  {/* Stérile P2 */}
                  <td style={{padding:'11px 14px', background:'#1A0800', borderLeft:'3px solid #B45309'}}>
                    <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
                      <span style={{fontSize:'10px',color:'#FCA5A599',fontWeight:600}}>A</span>
                      <span style={{fontWeight:900,color:'#FCA5A5',fontSize:'14px'}}>{rotations.reduce((a,r)=>a+(r.sterile_p2a_vgs||0),0)||'—'}</span>
                      <span style={{fontSize:'10px',color:'#FCA5A560',margin:'0 2px'}}>·</span>
                      <span style={{fontSize:'10px',color:'#FCA5A599',fontWeight:600}}>B</span>
                      <span style={{fontWeight:900,color:'#FCA5A580',fontSize:'14px'}}>{rotations.reduce((a,r)=>a+(r.sterile_p2b_vgs||0),0)||'—'}</span>
                    </div>
                  </td>
                  {/* Phosphate P2 */}
                  <td style={{padding:'11px 14px', background:'#06060F', borderLeft:'3px solid #1E40AF'}}>
                    <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
                      <span style={{fontSize:'10px',color:'#A5B4FC99',fontWeight:600}}>A</span>
                      <span style={{fontWeight:900,color:'#A5B4FC',fontSize:'14px'}}>{rotations.reduce((a,r)=>a+(r.phosphate_p2a_vgs||0),0)||'—'}</span>
                      <span style={{fontSize:'10px',color:'#A5B4FC60',margin:'0 2px'}}>·</span>
                      <span style={{fontSize:'10px',color:'#A5B4FC99',fontWeight:600}}>B</span>
                      <span style={{fontWeight:900,color:'#A5B4FC80',fontSize:'14px'}}>{rotations.reduce((a,r)=>a+(r.phosphate_p2b_vgs||0),0)||'—'}</span>
                    </div>
                  </td>
                  {/* Total + résumé */}
                  <td style={{padding:'11px 12px', textAlign:'center', fontWeight:900, color:'white', fontSize:'16px', borderLeft:'2px solid #334155'}}>{totalVoy||'—'}</td>
                  <td colSpan={2} style={{padding:'11px 10px', color:'#94A3B8', fontSize:'11px', whiteSpace:'nowrap'}}>
                    P: {fmt(volPhos)} m³ · S: {fmt(volSter)} m³ · ∑ {fmt(volPhos+volSter)} m³
                  </td>
                </tr>
              </tfoot>
              <tbody>
                {rotations.map((r, i) => (
                  <RotRow key={r.id} r={r} idx={i} onEdit={row => setModal({row})} onDelete={handleDelete} deleting={deleting}/>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <RotationModal date={date} row={modal.row} affectations={affectations}
          existingCamions={existingCamions} onSave={handleSaved} onClose={()=>setModal(null)}/>
      )}
    </div>
  );
}
