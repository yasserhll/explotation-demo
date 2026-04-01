import { useState, useEffect } from 'react';
import { rotationAPI, affectationAPI } from '../services/api';

const PANNEAUX = [
  'TG3 2EME SORTIE P7 / DECHARGE','TG3 P7 1ER SORTIE / DECHARGE','TG3 P7 / DECHARGE',
  'TF8 INT 3/4 P5 / DECHARGE','TF8 P5 3/4 / DECHARGE','TF8 C4 P5 / CRIBLAGE MOBILE',
  'TF8 P5 / CRIBLAGE MOBILE','TF8 P5 / DECHARGE','TE9 P5 / DECHARGE',
  'TG4 P7 / TREMIE 1','TG4 P7 / STOCK GOUDRON','TG4 P7 / STOCK BASCULE',
  'TJ9 P6 / CRIBLAGE MOBILE','TJ9 P6 / STOCK PSF',
  'T39 P2 / DECHARGE','T43 P2 / DECHARGE','REPRISE PSF / CRIBLAGE MOBILE',
  'TE10 P5 / STOCK ZAGORA','TH15 P7 / STOCK GOUDRON','TF8 P5 / STOCK PSF',
  'TF8 P5 / STOCK PSF SC',
];

const cleanDate = v => v ? String(v).slice(0,10) : '';
const getToday  = () => { const n=new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`; };
const fmt       = n => Number(n||0).toLocaleString('fr-FR');
const labelDate = d => { if(!d) return ''; try { return new Date(d+'T12:00:00').toLocaleDateString('fr-FR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'}); } catch { return d; } };
const pillDate  = d => { if(!d) return ''; try { return new Date(cleanDate(d)+'T12:00:00').toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'}); } catch { return d; } };

const inp   = { width:'100%',border:'1px solid #E5E7EB',borderRadius:'8px',background:'#F9FAFB',padding:'7px 10px',fontSize:'13px',outline:'none',boxSizing:'border-box' };
const inpSm = { ...inp, padding:'7px 6px', textAlign:'center' };

const emptyRow = () => ({ niveau:'', panneau:'', km:'', vgs:'' });
const emptySections = () => ({ phosphate_p1:[emptyRow()], phosphate_p2:[emptyRow()], sterile_p1:[emptyRow()], sterile_p2:[emptyRow()] });

function parseLignesFromRow(row) {
  if (row?.lignes_json) {
    try {
      const parsed = typeof row.lignes_json === 'string' ? JSON.parse(row.lignes_json) : row.lignes_json;
      if (parsed && typeof parsed === 'object') {
        const sections = { phosphate_p1:[], phosphate_p2:[], sterile_p1:[], sterile_p2:[] };
        Object.keys(sections).forEach(k => {
          sections[k] = (parsed[k] || []).length ? parsed[k] : [emptyRow()];
        });
        return sections;
      }
    } catch {}
  }
  // Rétrocompatibilité a/b
  const s = emptySections();
  [['phosphate_p1','phosphate_p1'],['phosphate_p2','phosphate_p2'],['sterile_p1','sterile_p1'],['sterile_p2','sterile_p2']].forEach(([sk, rk]) => {
    const [type, p] = rk.split('_');
    const rows = [];
    ['a','b'].forEach(l => {
      const pan = row?.[`${type}_${p}${l}_panneau`];
      if (pan) rows.push({ niveau:'', panneau:pan, km: row?.[`${type}_${p}${l}_km`]??'', vgs: row?.[`${type}_${p}${l}_vgs`]??'' });
    });
    s[sk] = rows.length ? rows : [emptyRow()];
  });
  return s;
}

function buildPayload(sections, date, camionId, ch1, ch2, comm, pellesCodes) {
  const n = v => (v!=='' && v!=null) ? v : null;
  const payload = { date, camion_id: camionId, chauffeur_1er: n(ch1), chauffeur_2e: n(ch2), commentaires: n(comm),
    pelle_codes: pellesCodes.length ? pellesCodes.join(',') : null,
    lignes_json: JSON.stringify(sections),
  };
  // Backward compat: fill a/b from first 2 rows of each section
  const SMAP = [['phosphate_p1','phosphate_p1'],['phosphate_p2','phosphate_p2'],['sterile_p1','sterile_p1'],['sterile_p2','sterile_p2']];
  SMAP.forEach(([sk, rk]) => {
    const [type, p] = rk.split('_');
    ['a','b'].forEach((l,i) => {
      const row = sections[sk]?.[i];
      payload[`${type}_${p}${l}_panneau`] = n(row?.panneau);
      payload[`${type}_${p}${l}_km`]      = n(row?.km);
      payload[`${type}_${p}${l}_vgs`]     = n(row?.vgs);
    });
  });
  return payload;
}

// ── CheckItem ─────────────────────────────────────────────────────────────────
function CheckItem({ code, label1, label2, checked, onChange, color, bgColor }) {
  return (
    <label style={{ display:'flex',alignItems:'center',gap:'8px',padding:'7px 10px',borderRadius:'8px',cursor:'pointer',border:`1px solid ${checked?color+'60':'#E5E7EB'}`,background:checked?bgColor:'#FAFAFA',transition:'all 0.15s',userSelect:'none' }}>
      <div style={{ width:'17px',height:'17px',borderRadius:'5px',flexShrink:0,border:checked?`2px solid ${color}`:'2px solid #D1D5DB',background:checked?color:'white',display:'flex',alignItems:'center',justifyContent:'center' }}>
        {checked&&<svg viewBox="0 0 12 10" fill="none" width="9" height="9"><polyline points="1,5 4,8 11,1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:800,fontSize:'12px',color:checked?color:'#374151',fontFamily:'monospace' }}>{code}</div>
        {label1&&<div style={{ fontSize:'10px',color:'#6B7280',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{label1}{label2?` / ${label2}`:''}</div>}
      </div>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ display:'none' }}/>
    </label>
  );
}

function SelectionSection({ title, icon, color, bgColor, items, selected, onToggle, onSelectAll, onClearAll, emptyMsg }) {
  const allSelected = items.length > 0 && items.every(i => selected.includes(i.code));
  return (
    <div style={{ border:`1px solid ${color}30`,borderRadius:'12px',overflow:'hidden' }}>
      <div style={{ padding:'9px 12px',background:`${color}12`,borderBottom:`1px solid ${color}20`,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
        <div style={{ display:'flex',alignItems:'center',gap:'7px' }}>
          <span>{icon}</span>
          <span style={{ fontWeight:700,fontSize:'13px',color }}>{title}</span>
          {selected.length>0&&<span style={{ background:color,color:'white',fontSize:'10px',fontWeight:700,padding:'1px 7px',borderRadius:'10px' }}>{selected.length}</span>}
        </div>
        <div style={{ display:'flex',gap:'5px' }}>
          {!allSelected&&items.length>0&&<button onClick={onSelectAll} style={{ fontSize:'11px',fontWeight:600,padding:'3px 9px',borderRadius:'6px',border:`1px solid ${color}40`,background:'white',color,cursor:'pointer' }}>Tout</button>}
          {selected.length>0&&<button onClick={onClearAll} style={{ fontSize:'11px',fontWeight:600,padding:'3px 9px',borderRadius:'6px',border:'1px solid #E5E7EB',background:'white',color:'#6B7280',cursor:'pointer' }}>Aucun</button>}
        </div>
      </div>
      <div style={{ padding:'7px',maxHeight:'210px',overflowY:'auto',display:'flex',flexDirection:'column',gap:'3px' }}>
        {items.length===0
          ? <div style={{ textAlign:'center',padding:'16px',color:'#9CA3AF',fontSize:'12px' }}>{emptyMsg}</div>
          : items.map(item=><CheckItem key={item.code} code={item.code} label1={item.chauffeur_1} label2={item.chauffeur_2} checked={selected.includes(item.code)} onChange={()=>onToggle(item.code)} color={color} bgColor={bgColor}/>)
        }
      </div>
    </div>
  );
}

// ── Ligne dynamique par section ───────────────────────────────────────────────
function DynamicRow({ row, idx, color, onUpdate, onRemove, isOnly }) {
  return (
    <div style={{ display:'grid',gridTemplateColumns:'60px 1fr 65px 65px 28px',gap:'4px',alignItems:'center' }}>
      <input value={row.niveau||''} onChange={e=>onUpdate(idx,'niveau',e.target.value)} placeholder="Niv." title="Niveau (ex: C2, SA1)" style={{ ...inp, fontFamily:'monospace',fontWeight:700,fontSize:'12px',padding:'6px 6px',textAlign:'center' }}/>
      <input list="pl" value={row.panneau||''} onChange={e=>onUpdate(idx,'panneau',e.target.value)} placeholder="Panneau / Destination" style={inp} autoComplete="off"/>
      <input type="text" inputMode="decimal" value={row.km||''} onChange={e=>onUpdate(idx,'km',e.target.value.replace(',','.'))} placeholder="km" style={inpSm}/>
      <input type="text" inputMode="numeric" value={row.vgs||''} onChange={e=>onUpdate(idx,'vgs',e.target.value)} placeholder="Vgs" style={inpSm}/>
      <button onClick={()=>onRemove(idx)} disabled={isOnly} title="Supprimer cette ligne" style={{ width:'26px',height:'26px',border:`1px solid ${isOnly?'#E5E7EB':'#FECACA'}`,borderRadius:'6px',background:isOnly?'#F9FAFB':'#FEF2F2',color:isOnly?'#D1D5DB':'#EF4444',cursor:isOnly?'default':'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:'14px',fontWeight:700 }}>×</button>
    </div>
  );
}

function DynamicSection({ title, icon, color, bg, sectionKey, rows, onUpdate, onAdd, onRemove }) {
  return (
    <div style={{ border:`1px solid ${color}40`,borderRadius:'10px',padding:'8px 10px',background:bg }}>
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'6px' }}>
        <div style={{ fontSize:'10px',fontWeight:700,color,textTransform:'uppercase' }}>{icon} {title}</div>
        <button onClick={onAdd} style={{ fontSize:'11px',fontWeight:700,color,background:'white',border:`1px solid ${color}40`,borderRadius:'6px',padding:'2px 8px',cursor:'pointer' }}>+ Ligne</button>
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'60px 1fr 65px 65px 28px',gap:'4px',marginBottom:'4px' }}>
        <div style={{ fontSize:'9px',color:'#9CA3AF',textAlign:'center',fontWeight:600 }}>Niveau</div>
        <div style={{ fontSize:'9px',color:'#9CA3AF',fontWeight:600,paddingLeft:'4px' }}>Panneau / Destination</div>
        <div style={{ fontSize:'9px',color:'#9CA3AF',textAlign:'center',fontWeight:600 }}>km</div>
        <div style={{ fontSize:'9px',color:'#9CA3AF',textAlign:'center',fontWeight:600 }}>Vgs</div>
        <div/>
      </div>
      <div style={{ display:'flex',flexDirection:'column',gap:'4px' }}>
        {rows.map((row,i)=>(
          <DynamicRow key={i} row={row} idx={i} color={color} isOnly={rows.length===1} onUpdate={(idx,field,val)=>onUpdate(sectionKey,idx,field,val)} onRemove={idx=>onRemove(sectionKey,idx)}/>
        ))}
      </div>
    </div>
  );
}

const SECTIONS_DEF = [
  {key:'sterile_p1',   title:'Stérile — Poste 1',   icon:'🟡', color:'#D97706', bg:'#D97706' +'08'},
  {key:'phosphate_p1', title:'Phosphate — Poste 1',  icon:'🔵', color:'#2563EB', bg:'#2563EB' +'08'},
  {key:'sterile_p2',   title:'Stérile — Poste 2',    icon:'🟠', color:'#B45309', bg:'#B45309' +'08'},
  {key:'phosphate_p2', title:'Phosphate — Poste 2',  icon:'🟦', color:'#1D4ED8', bg:'#1D4ED8' +'08'},
];

// ── Modal Saisie Groupée (Bulk) ───────────────────────────────────────────────
function BulkAddModal({ date, affectations, pelles, existingCamions, onSave, onClose }) {
  const camionsDispos = affectations.filter(a=>a.type_vehicule==='camion' && !existingCamions.includes(a.camion_code));
  const [sections,      setSections]      = useState(emptySections());
  const [selectedCams,  setSelectedCams]  = useState([]);
  const [selectedPells, setSelectedPells] = useState([]);
  const [comm,          setComm]          = useState('');
  const [saving,        setSaving]        = useState(false);
  const [err,           setErr]           = useState('');
  const [progress,      setProgress]      = useState(null);

  const toggleCam  = code => setSelectedCams(p=>p.includes(code)?p.filter(c=>c!==code):[...p,code]);
  const togglePell = code => setSelectedPells(p=>p.includes(code)?p.filter(c=>c!==code):[...p,code]);
  const camItems   = camionsDispos.map(a=>({code:a.camion_code,chauffeur_1:a.chauffeur_principal,chauffeur_2:a.chauffeur_secondaire}));
  const pelleItems = pelles.map(p=>({code:p.code,chauffeur_1:p.chauffeur_principal,chauffeur_2:p.chauffeur_secondaire}));

  const updateRow   = (sk,idx,field,val) => setSections(p=>{ const n={...p,[sk]:[...p[sk]]};n[sk][idx]={...n[sk][idx],[field]:val};return n; });
  const addRow      = (sk) => setSections(p=>({...p,[sk]:[...p[sk],emptyRow()]}));
  const removeRow   = (sk,idx) => setSections(p=>{ if(p[sk].length<=1)return p; const n={...p,[sk]:[...p[sk]]};n[sk].splice(idx,1);return n; });

  const submit = async () => {
    if (selectedCams.length===0) { setErr('Sélectionnez au moins un camion.'); return; }
    setSaving(true); setErr('');
    let done=0; const errors=[];
    setProgress({done:0,total:selectedCams.length});
    for (const camCode of selectedCams) {
      const aff = affectations.find(a=>a.camion_code===camCode);
      const payload = buildPayload(sections, date, camCode, aff?.chauffeur_principal||null, aff?.chauffeur_secondaire||null, comm, selectedPells);
      try { await rotationAPI.create(payload); done++; setProgress({done,total:selectedCams.length}); }
      catch(e) { errors.push(`${camCode}: ${e.response?.data?.message||'Erreur'}`); }
    }
    setSaving(false); setProgress(null);
    if (errors.length) setErr(errors.join(' | '));
    if (done>0) onSave(done);
  };

  return (
    <div style={{ position:'fixed',inset:0,zIndex:50,background:'rgba(0,0,0,0.6)',overflowY:'auto',padding:'16px' }}>
      <div style={{ background:'white',borderRadius:'18px',width:'100%',maxWidth:'1020px',margin:'0 auto',boxShadow:'0 24px 60px rgba(0,0,0,0.35)' }}>
        <div style={{ padding:'14px 22px',borderBottom:'1px solid #F1F5F9',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <div>
            <div style={{ fontWeight:800,fontSize:'16px',color:'#111827',display:'flex',alignItems:'center',gap:'10px' }}>
              <span style={{ background:'linear-gradient(135deg,#004B8D,#0066CC)',color:'white',padding:'3px 10px',borderRadius:'7px',fontSize:'12px',fontWeight:700 }}>Saisie groupée</span>
              Ajouter des rotations — {labelDate(date)}
            </div>
            <div style={{ fontSize:'12px',color:'#9CA3AF',marginTop:'2px' }}>Remplissez les données, puis cochez les camions et pelles qui travaillent ensemble sur ces panneaux</div>
          </div>
          <button onClick={onClose} style={{ width:'32px',height:'32px',border:'none',borderRadius:'10px',background:'#F3F4F6',cursor:'pointer',fontSize:'16px',color:'#6B7280' }}>✕</button>
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 330px' }}>
          {/* Gauche : sections dynamiques */}
          <div style={{ padding:'18px 18px 18px 22px',borderRight:'1px solid #F1F5F9',overflowY:'auto',maxHeight:'72vh' }}>
            <div style={{ fontSize:'11px',fontWeight:700,color:'#6B7280',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:'10px' }}>📋 Données de production</div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px' }}>
              {SECTIONS_DEF.map(s=>(
                <DynamicSection key={s.key} title={s.title} icon={s.icon} color={s.color} bg={s.bg} sectionKey={s.key} rows={sections[s.key]}
                  onUpdate={updateRow} onAdd={()=>addRow(s.key)} onRemove={removeRow}/>
              ))}
            </div>
            <div style={{ marginTop:'10px' }}>
              <div style={{ fontSize:'11px',fontWeight:700,color:'#6B7280',textTransform:'uppercase',marginBottom:'5px' }}>Commentaires</div>
              <textarea value={comm} onChange={e=>setComm(e.target.value)} rows={2} placeholder="Observations, incidents…" style={{ ...inp,resize:'vertical',minHeight:'48px' }}/>
            </div>
          </div>
          {/* Droite : sélection */}
          <div style={{ padding:'18px',display:'flex',flexDirection:'column',gap:'12px',background:'#FAFBFD',overflowY:'auto',maxHeight:'72vh' }}>
            <div style={{ fontSize:'11px',fontWeight:700,color:'#6B7280',textTransform:'uppercase',letterSpacing:'.5px' }}>🚛 Engins</div>
            <SelectionSection title="Camions" icon="🚛" color="#1D4ED8" bgColor="#EFF6FF"
              items={camItems} selected={selectedCams} onToggle={toggleCam}
              onSelectAll={()=>setSelectedCams(camItems.map(i=>i.code))} onClearAll={()=>setSelectedCams([])}
              emptyMsg={existingCamions.length?"Tous les camions sont saisis":"Aucun camion"}/>
            <SelectionSection title="Pelles associées" icon="⛏️" color="#7C3AED" bgColor="#F5F3FF"
              items={pelleItems} selected={selectedPells} onToggle={togglePell}
              onSelectAll={()=>setSelectedPells(pelleItems.map(i=>i.code))} onClearAll={()=>setSelectedPells([])}
              emptyMsg="Aucune pelle disponible"/>
            {err&&<div style={{ background:'#FEF2F2',border:'1px solid #FECACA',color:'#DC2626',padding:'8px 10px',borderRadius:'8px',fontSize:'12px' }}>{err}</div>}
          </div>
        </div>
        <div style={{ padding:'12px 22px',borderTop:'1px solid #F1F5F9',display:'flex',alignItems:'center',justifyContent:'space-between',background:'#F8FAFC',borderRadius:'0 0 18px 18px' }}>
          <div style={{ fontSize:'13px' }}>
            {selectedCams.length===0?<span style={{ color:'#9CA3AF' }}>Aucun camion sélectionné</span>
              :<><span style={{ fontWeight:700,color:'#1D4ED8' }}>{selectedCams.length} camion{selectedCams.length>1?'s':''}</span>
                {selectedPells.length>0&&<> + <span style={{ fontWeight:700,color:'#7C3AED' }}>{selectedPells.length} pelle{selectedPells.length>1?'s':''}</span></>}
                <span style={{ color:'#6B7280' }}> → {selectedCams.length} rotation{selectedCams.length>1?'s':''} à créer</span></>}
          </div>
          <div style={{ display:'flex',gap:'8px' }}>
            <button onClick={onClose} style={{ padding:'8px 16px',border:'none',borderRadius:'10px',background:'#F3F4F6',color:'#374151',fontWeight:600,fontSize:'14px',cursor:'pointer' }}>Annuler</button>
            <button onClick={submit} disabled={saving||selectedCams.length===0} style={{ padding:'8px 20px',border:'none',borderRadius:'10px',background:selectedCams.length===0?'#E5E7EB':'linear-gradient(135deg,#004B8D,#0066CC)',color:selectedCams.length===0?'#9CA3AF':'white',fontWeight:700,fontSize:'14px',cursor:selectedCams.length===0?'default':'pointer',display:'flex',alignItems:'center',gap:'8px' }}>
              {saving?<><div style={{ width:'13px',height:'13px',border:'2px solid rgba(255,255,255,0.4)',borderTopColor:'white',borderRadius:'50%',animation:'spin 0.6s linear infinite' }}/>{progress?`${progress.done}/${progress.total}…`:'Sauvegarde…'}</>:`✓ Enregistrer${selectedCams.length>1?` (${selectedCams.length})`:''}`}
            </button>
          </div>
        </div>
      </div>
      <datalist id="pl">{PANNEAUX.map(v=><option key={v} value={v}/>)}</datalist>
    </div>
  );
}

// ── Modal Édition ─────────────────────────────────────────────────────────────
function EditModal({ date, row, affectations, pelles, onSave, onClose }) {
  const [sections,      setSections]      = useState(() => parseLignesFromRow(row));
  const [ch1,           setCh1]           = useState(row?.chauffeur_1er||'');
  const [ch2,           setCh2]           = useState(row?.chauffeur_2e ||'');
  const [comm,          setComm]          = useState(row?.commentaires ||'');
  const [selectedPells, setSelectedPells] = useState(row?.pelle_codes?row.pelle_codes.split(',').map(s=>s.trim()).filter(Boolean):[]);
  const [saving,        setSaving]        = useState(false);
  const [err,           setErr]           = useState('');

  const togglePell = code => setSelectedPells(p=>p.includes(code)?p.filter(c=>c!==code):[...p,code]);
  const pelleItems = pelles.map(p=>({code:p.code,chauffeur_1:p.chauffeur_principal,chauffeur_2:p.chauffeur_secondaire}));
  const updateRow  = (sk,idx,field,val) => setSections(p=>{ const n={...p,[sk]:[...p[sk]]};n[sk][idx]={...n[sk][idx],[field]:val};return n; });
  const addRow     = sk => setSections(p=>({...p,[sk]:[...p[sk],emptyRow()]}));
  const removeRow  = (sk,idx) => setSections(p=>{ if(p[sk].length<=1)return p; const n={...p,[sk]:[...p[sk]]};n[sk].splice(idx,1);return n; });

  const submit = async () => {
    setSaving(true); setErr('');
    try {
      const payload = buildPayload(sections, date, row.camion_id, ch1, ch2, comm, selectedPells);
      delete payload.date; delete payload.camion_id;
      await rotationAPI.update(row.id, payload);
      onSave();
    } catch(e) { setErr(e.response?.data?.message||'Erreur.'); }
    setSaving(false);
  };

  return (
    <div style={{ position:'fixed',inset:0,zIndex:50,background:'rgba(0,0,0,0.55)',overflowY:'auto',padding:'16px' }}>
      <div style={{ background:'white',borderRadius:'16px',width:'100%',maxWidth:'800px',margin:'0 auto',boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ padding:'14px 22px',borderBottom:'1px solid #F1F5F9',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <div style={{ fontWeight:700,fontSize:'16px',color:'#111827',display:'flex',alignItems:'center',gap:'8px' }}>
            Modifier
            <span style={{ fontWeight:900,color:'#1D4ED8',fontFamily:'monospace',fontSize:'16px',background:'#EFF6FF',padding:'3px 10px',borderRadius:'8px' }}>{row?.camion_id}</span>
            <span style={{ fontSize:'13px',color:'#9CA3AF',fontWeight:400 }}>— {date}</span>
          </div>
          <button onClick={onClose} style={{ width:'30px',height:'30px',border:'none',borderRadius:'8px',background:'#F3F4F6',cursor:'pointer',fontSize:'16px',color:'#6B7280' }}>✕</button>
        </div>
        <div style={{ padding:'18px 22px',display:'flex',flexDirection:'column',gap:'12px' }}>
          {err&&<div style={{ background:'#FEF2F2',border:'1px solid #FECACA',color:'#DC2626',padding:'8px 10px',borderRadius:'8px',fontSize:'13px' }}>{err}</div>}
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px' }}>
            <div><div style={{ fontSize:'11px',fontWeight:700,color:'#6B7280',textTransform:'uppercase',marginBottom:'4px' }}>Chauffeur 1er Poste</div><input value={ch1} onChange={e=>setCh1(e.target.value)} style={inp} placeholder="Nom"/></div>
            <div><div style={{ fontSize:'11px',fontWeight:700,color:'#6B7280',textTransform:'uppercase',marginBottom:'4px' }}>Chauffeur 2e Poste</div><input value={ch2} onChange={e=>setCh2(e.target.value)} style={inp} placeholder="Nom"/></div>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px' }}>
            {SECTIONS_DEF.map(s=>(
              <DynamicSection key={s.key} title={s.title} icon={s.icon} color={s.color} bg={s.bg} sectionKey={s.key} rows={sections[s.key]}
                onUpdate={updateRow} onAdd={()=>addRow(s.key)} onRemove={removeRow}/>
            ))}
          </div>
          {pelleItems.length>0&&(
            <SelectionSection title="Pelles associées" icon="⛏️" color="#7C3AED" bgColor="#F5F3FF"
              items={pelleItems} selected={selectedPells} onToggle={togglePell}
              onSelectAll={()=>setSelectedPells(pelleItems.map(i=>i.code))} onClearAll={()=>setSelectedPells([])}
              emptyMsg="Aucune pelle disponible"/>
          )}
          <div><div style={{ fontSize:'11px',fontWeight:700,color:'#6B7280',textTransform:'uppercase',marginBottom:'5px' }}>Commentaires</div>
            <textarea value={comm} onChange={e=>setComm(e.target.value)} rows={2} style={{ ...inp,resize:'vertical',minHeight:'55px' }} placeholder="Observations…"/></div>
        </div>
        <div style={{ padding:'12px 22px',borderTop:'1px solid #F1F5F9',display:'flex',gap:'8px',justifyContent:'flex-end' }}>
          <button onClick={onClose} style={{ padding:'8px 16px',border:'none',borderRadius:'10px',background:'#F3F4F6',color:'#374151',fontWeight:600,fontSize:'14px',cursor:'pointer' }}>Annuler</button>
          <button onClick={submit} disabled={saving} style={{ padding:'8px 20px',border:'none',borderRadius:'10px',background:'linear-gradient(135deg,#004B8D,#0066CC)',color:'white',fontWeight:700,fontSize:'14px',cursor:'pointer',opacity:saving?0.6:1 }}>
            {saving?'Sauvegarde…':'✓ Modifier'}
          </button>
        </div>
      </div>
      <datalist id="pl">{PANNEAUX.map(v=><option key={v} value={v}/>)}</datalist>
    </div>
  );
}

// ── Cellule tableau ───────────────────────────────────────────────────────────
function PanneauCell({ pa, ka, va, pb, kb, vb, color, bg }) {
  const has=(pan,km,vgs)=>pan||km||(vgs!=null&&vgs!='');
  const hasA=has(pa,ka,va); const hasB=has(pb,kb,vb);
  const short=v=>v?v.split('/')[0].trim():'—'; const val=v=>(v!=null&&v!='')? v:'—';
  if(!hasA&&!hasB) return <td style={{padding:'0 14px',background:bg,borderLeft:`3px solid ${color}20`,textAlign:'center',color:'#CBD5E1',fontSize:'12px'}}>—</td>;
  return (
    <td style={{padding:'7px 10px',background:bg,borderLeft:`3px solid ${color}`}}>
      <table style={{borderCollapse:'collapse',width:'100%'}}><tbody>
        {hasA&&<tr>
          <td style={{paddingRight:'5px',width:'18px'}}><span style={{fontSize:'9px',fontWeight:900,color:'white',background:color,borderRadius:'3px',padding:'1px 4px'}}>A</span></td>
          <td style={{fontSize:'11px',color:'#374151',whiteSpace:'nowrap',maxWidth:'100px',overflow:'hidden',textOverflow:'ellipsis',paddingRight:'6px'}} title={pa||''}>{short(pa)}</td>
          <td style={{fontSize:'11px',color:'#94A3B8',whiteSpace:'nowrap',textAlign:'right',paddingRight:'8px',width:'48px'}}>{ka?ka+' km':''}</td>
          <td style={{fontSize:'12px',fontWeight:900,color:val(va)!=='—'?color:'#CBD5E1',textAlign:'right',width:'26px'}}>{val(va)}</td>
        </tr>}
        {hasA&&hasB&&<tr><td colSpan={4} style={{padding:'2px 0'}}><div style={{borderTop:`1px dashed ${color}30`}}/></td></tr>}
        {hasB&&<tr>
          <td style={{paddingRight:'5px',width:'18px'}}><span style={{fontSize:'9px',fontWeight:900,color:color,background:color+'20',borderRadius:'3px',padding:'1px 4px',border:`1px solid ${color}40`}}>B</span></td>
          <td style={{fontSize:'11px',color:'#374151',whiteSpace:'nowrap',maxWidth:'100px',overflow:'hidden',textOverflow:'ellipsis',paddingRight:'6px'}} title={pb||''}>{short(pb)}</td>
          <td style={{fontSize:'11px',color:'#94A3B8',whiteSpace:'nowrap',textAlign:'right',paddingRight:'8px',width:'48px'}}>{kb?kb+' km':''}</td>
          <td style={{fontSize:'12px',fontWeight:900,color:val(vb)!=='—'?color:'#CBD5E1',textAlign:'right',width:'26px'}}>{val(vb)}</td>
        </tr>}
      </tbody></table>
    </td>
  );
}

function RotRow({ r, onEdit, onDelete, deleting, idx }) {
  const calcTotal = (rot) => {
    if (rot.lignes_json) {
      try {
        const l = typeof rot.lignes_json==='string'?JSON.parse(rot.lignes_json):rot.lignes_json;
        let t=0;
        Object.values(l).forEach(rows=>Array.isArray(rows)&&rows.forEach(row=>t+=(parseInt(row.vgs)||0)));
        return t;
      } catch {}
    }
    return (r.sterile_p1a_vgs||0)+(r.sterile_p1b_vgs||0)+(r.phosphate_p1a_vgs||0)+(r.phosphate_p1b_vgs||0)
          +(r.sterile_p2a_vgs||0)+(r.sterile_p2b_vgs||0)+(r.phosphate_p2a_vgs||0)+(r.phosphate_p2b_vgs||0);
  };
  const total  = calcTotal(r);
  const rowBg  = idx%2===0?'#FFFFFF':'#FAFBFD';
  const pelles = r.pelle_codes?r.pelle_codes.split(',').map(s=>s.trim()).filter(Boolean):[];
  return (
    <tr style={{background:rowBg,borderBottom:'1px solid #F1F5F9'}} onMouseEnter={e=>e.currentTarget.style.background='#EFF6FF'} onMouseLeave={e=>e.currentTarget.style.background=rowBg}>
      <td style={{padding:'9px 10px',borderRight:'1px solid #E2E8F0'}}>
        <div style={{ fontWeight:900,color:'#1D4ED8',fontFamily:'monospace',fontSize:'13px' }}>{r.camion_id}</div>
        {pelles.length>0&&<div style={{ display:'flex',flexWrap:'wrap',gap:'2px',marginTop:'3px' }}>{pelles.map(p=><span key={p} style={{ fontSize:'9px',fontWeight:700,color:'#7C3AED',background:'#F5F3FF',border:'1px solid #DDD6FE',borderRadius:'3px',padding:'1px 4px',fontFamily:'monospace' }}>⛏ {p}</span>)}</div>}
      </td>
      <td style={{padding:'9px 8px',fontSize:'12px',color:'#1F2937',whiteSpace:'nowrap'}}>{r.chauffeur_1er||<span style={{color:'#CBD5E1'}}>—</span>}</td>
      <td style={{padding:'9px 8px',fontSize:'12px',color:'#6B7280',whiteSpace:'nowrap',borderRight:'2px solid #CBD5E1'}}>{r.chauffeur_2e||<span style={{color:'#CBD5E1'}}>—</span>}</td>
      <PanneauCell pa={r.sterile_p1a_panneau}   ka={r.sterile_p1a_km}   va={r.sterile_p1a_vgs}   pb={r.sterile_p1b_panneau}   kb={r.sterile_p1b_km}   vb={r.sterile_p1b_vgs}   color="#D97706" bg={idx%2===0?'#FFFDF5':'#FFFBEB'}/>
      <PanneauCell pa={r.phosphate_p1a_panneau} ka={r.phosphate_p1a_km} va={r.phosphate_p1a_vgs} pb={r.phosphate_p1b_panneau} kb={r.phosphate_p1b_km} vb={r.phosphate_p1b_vgs} color="#1D4ED8" bg={idx%2===0?'#F8FBFF':'#EFF6FF'}/>
      <PanneauCell pa={r.sterile_p2a_panneau}   ka={r.sterile_p2a_km}   va={r.sterile_p2a_vgs}   pb={r.sterile_p2b_panneau}   kb={r.sterile_p2b_km}   vb={r.sterile_p2b_vgs}   color="#B45309" bg={idx%2===0?'#FFFDF5':'#FEF3C7'}/>
      <PanneauCell pa={r.phosphate_p2a_panneau} ka={r.phosphate_p2a_km} va={r.phosphate_p2a_vgs} pb={r.phosphate_p2b_panneau} kb={r.phosphate_p2b_km} vb={r.phosphate_p2b_vgs} color="#1E40AF" bg={idx%2===0?'#F8F8FF':'#EEF2FF'}/>
      <td style={{padding:'9px 10px',textAlign:'center',fontWeight:900,fontSize:'14px',color:total?'#111827':'#CBD5E1',borderLeft:'2px solid #E2E8F0',background:total?(idx%2===0?'#F8FAFC':'#F1F5F9'):rowBg}}>{total||'—'}</td>
      <td style={{padding:'9px 8px',fontSize:'11px',color:'#9CA3AF',maxWidth:'110px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} title={r.commentaires||''}>{r.commentaires||''}</td>
      <td style={{padding:'9px 10px',textAlign:'center'}}>
        <div style={{display:'inline-flex',gap:'4px'}}>
          <button onClick={()=>onEdit(r)} style={{width:'28px',height:'28px',border:'1px solid #BFDBFE',borderRadius:'7px',background:'#EFF6FF',color:'#2563EB',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}} onMouseEnter={e=>{e.currentTarget.style.background='#2563EB';e.currentTarget.style.color='white';}} onMouseLeave={e=>{e.currentTarget.style.background='#EFF6FF';e.currentTarget.style.color='#2563EB';}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/></svg>
          </button>
          <button onClick={()=>onDelete(r.id)} disabled={deleting===r.id} style={{width:'28px',height:'28px',border:'1px solid #FECACA',borderRadius:'7px',background:'#FEF2F2',color:'#EF4444',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',opacity:deleting===r.id?0.4:1}} onMouseEnter={e=>{if(deleting!==r.id){e.currentTarget.style.background='#EF4444';e.currentTarget.style.color='white';}}} onMouseLeave={e=>{e.currentTarget.style.background='#FEF2F2';e.currentTarget.style.color='#EF4444';}}>
            {deleting===r.id?<div style={{width:'10px',height:'10px',border:'2px solid #EF4444',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.6s linear infinite'}}/>:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>}
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function RotationChauffeurs() {
  const [date,         setDate]         = useState(getToday());
  const [rotations,    setRotations]    = useState([]);
  const [affectations, setAffectations] = useState([]);
  const [pelles,       setPelles]       = useState([]);
  const [datesExist,   setDatesExist]   = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [modal,        setModal]        = useState(null);
  const [deleting,     setDeleting]     = useState(null);
  const [msg,          setMsg]          = useState(null);

  const flash     = (text,ok=true) => { setMsg({text,ok}); setTimeout(()=>setMsg(null),3500); };
  const loadDates = () => rotationAPI.getDates().then(r=>setDatesExist(r.data||[])).catch(()=>{});
  const load      = d => {
    setLoading(true);
    rotationAPI.getByDate(d)
      .then(r=>{ setRotations((r.data.rotations||[]).map(row=>({...row,date:cleanDate(row.date)}))); setAffectations(r.data.affectations||[]); setLoading(false); })
      .catch(()=>setLoading(false));
  };

  // FIX: EnginController retourne {data:[...]} → r.data.data
  useEffect(()=>{ affectationAPI.getEngins().then(r=>setPelles((r.data?.data||r.data||[]).filter(e=>e.type==='PELLE'))).catch(()=>{}); },[]);
  useEffect(()=>{ loadDates(); },[]);
  useEffect(()=>{ load(date); },[date]);

  const handleBulkSaved = count => { setModal(null); load(date); loadDates(); flash(`✓ ${count} rotation${count>1?'s':''} enregistrée${count>1?'s':''}`); };
  const handleEditSaved = ()    => { setModal(null); load(date); flash('✓ Rotation modifiée'); };
  const handleDelete    = async id => {
    if (!confirm('Supprimer cette rotation ?')) return;
    setDeleting(id);
    try { await rotationAPI.delete(id); setRotations(p=>p.filter(r=>r.id!==id)); loadDates(); flash('✓ Supprimé'); }
    catch { flash('Erreur suppression',false); }
    setDeleting(null);
  };

  const totPhos  = rotations.reduce((a,r)=>{ if(r.lignes_json){try{const l=typeof r.lignes_json==='string'?JSON.parse(r.lignes_json):r.lignes_json;let t=0;['phosphate_p1','phosphate_p2'].forEach(k=>l[k]?.forEach(row=>t+=(parseInt(row.vgs)||0)));return a+t;}catch{}}return a+(r.phosphate_p1a_vgs||0)+(r.phosphate_p1b_vgs||0)+(r.phosphate_p2a_vgs||0)+(r.phosphate_p2b_vgs||0);},0);
  const totSter  = rotations.reduce((a,r)=>{ if(r.lignes_json){try{const l=typeof r.lignes_json==='string'?JSON.parse(r.lignes_json):r.lignes_json;let t=0;['sterile_p1','sterile_p2'].forEach(k=>l[k]?.forEach(row=>t+=(parseInt(row.vgs)||0)));return a+t;}catch{}}return a+(r.sterile_p1a_vgs||0)+(r.sterile_p1b_vgs||0)+(r.sterile_p2a_vgs||0)+(r.sterile_p2b_vgs||0);},0);
  const totalVoy = totPhos+totSter;
  const volPhos  = totPhos*16; const volSter=totSter*14;
  const existingCamions = rotations.map(r=>r.camion_id);

  return (
    <div style={{ display:'flex',flexDirection:'column',gap:'16px' }}>
      {msg&&<div style={{ position:'fixed',top:'16px',right:'16px',zIndex:100,padding:'12px 18px',borderRadius:'12px',fontWeight:600,fontSize:'14px',boxShadow:'0 4px 20px rgba(0,0,0,0.15)',background:msg.ok?'#F0FDF4':'#FEF2F2',border:`1px solid ${msg.ok?'#86EFAC':'#FECACA'}`,color:msg.ok?'#166534':'#DC2626' }}>{msg.text}</div>}
      {/* Header */}
      <div style={{ background:'white',borderRadius:'16px',border:'1px solid #F1F5F9',padding:'14px 18px',boxShadow:'0 1px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ display:'flex',flexWrap:'wrap',gap:'10px',alignItems:'center',justifyContent:'space-between' }}>
          <div>
            <div style={{ fontWeight:700,fontSize:'16px',color:'#111827' }}>Rotation des Chauffeurs</div>
            <div style={{ fontSize:'12px',color:'#9CA3AF',marginTop:'2px',textTransform:'capitalize' }}>{labelDate(date)}</div>
          </div>
          <div style={{ display:'flex',gap:'8px',alignItems:'center',flexWrap:'wrap' }}>
            <button onClick={()=>setDate(getToday())} style={{ padding:'7px 12px',borderRadius:'9px',fontWeight:600,fontSize:'13px',cursor:'pointer',border:date===getToday()?'none':'1px solid #E5E7EB',background:date===getToday()?'#2563EB':'#F9FAFB',color:date===getToday()?'white':'#374151' }}>Aujourd'hui</button>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{ border:'1px solid #E5E7EB',borderRadius:'9px',padding:'7px 10px',fontSize:'13px',background:'#F9FAFB',outline:'none' }}/>
            <button onClick={()=>setModal({mode:'add'})} style={{ display:'flex',alignItems:'center',gap:'6px',padding:'8px 14px',borderRadius:'9px',fontWeight:700,fontSize:'14px',border:'none',background:'linear-gradient(135deg,#004B8D,#0066CC)',color:'white',cursor:'pointer' }}>
              <span style={{ fontSize:'17px',lineHeight:1 }}>+</span> Ajouter
            </button>
          </div>
        </div>
        {datesExist.length>0&&(
          <div style={{ display:'flex',gap:'5px',flexWrap:'wrap',marginTop:'10px',paddingTop:'10px',borderTop:'1px solid #F9FAFB',alignItems:'center' }}>
            <span style={{ fontSize:'12px',color:'#9CA3AF',fontWeight:500 }}>Jours saisis :</span>
            {datesExist.slice(0,12).map(d=>(
              <button key={d.date} onClick={()=>setDate(cleanDate(d.date))} style={{ padding:'3px 9px',borderRadius:'7px',fontWeight:600,fontSize:'12px',cursor:'pointer',border:'none',background:cleanDate(d.date)===date?'#2563EB':'#EFF6FF',color:cleanDate(d.date)===date?'white':'#1D4ED8' }}>
                {pillDate(d.date)}<span style={{opacity:0.6}}>·{d.nb_camions}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {/* KPIs */}
      {rotations.length>0&&(
        <div style={{ display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'10px' }}>
          {[{l:'Camions',v:rotations.length,c:'#004B8D',bg:'#EFF6FF',b:'#BFDBFE'},{l:'Phosphate m³',v:fmt(volPhos)+' m³',c:'#1D4ED8',bg:'#DBEAFE',b:'#93C5FD'},{l:'Stérile m³',v:fmt(volSter)+' m³',c:'#B45309',bg:'#FEF3C7',b:'#FDE68A'},{l:'Total voyages',v:fmt(totalVoy),c:'#7C3AED',bg:'#F5F3FF',b:'#DDD6FE'},{l:'m³ total',v:fmt(volPhos+volSter)+' m³',c:'#00843D',bg:'#F0FDF4',b:'#BBF7D0'}].map((s,i)=>(
            <div key={i} style={{ borderRadius:'12px',padding:'12px 14px',display:'flex',alignItems:'center',justifyContent:'space-between',background:s.bg,border:`1px solid ${s.b}` }}>
              <span style={{ fontSize:'12px',fontWeight:600,color:s.c }}>{s.l}</span>
              <span style={{ fontSize:'17px',fontWeight:900,color:s.c }}>{s.v}</span>
            </div>
          ))}
        </div>
      )}
      {/* Tableau */}
      <div style={{ background:'white',borderRadius:'16px',border:'1px solid #F1F5F9',overflow:'hidden',boxShadow:'0 1px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ padding:'10px 18px',borderBottom:'1px solid #F1F5F9',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <span style={{ fontWeight:600,fontSize:'14px',color:'#374151' }}>{loading?'Chargement…':rotations.length>0?`${rotations.length} camion(s) · ${fmt(totalVoy)} voyages`:'Aucune rotation pour cette date'}</span>
          {rotations.length>0&&<button onClick={()=>setModal({mode:'add'})} style={{ padding:'5px 12px',borderRadius:'7px',fontWeight:600,fontSize:'12px',cursor:'pointer',border:'1px solid #BFDBFE',background:'#EFF6FF',color:'#1D4ED8' }}>+ Camion</button>}
        </div>
        {loading?(
          <div style={{ display:'flex',alignItems:'center',justifyContent:'center',padding:'60px',color:'#9CA3AF' }}>
            <div style={{ width:'18px',height:'18px',border:'2px solid #3B82F6',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.8s linear infinite',marginRight:'8px' }}/>Chargement…
          </div>
        ):rotations.length===0?(
          <div style={{ textAlign:'center',padding:'60px 20px' }}>
            <div style={{ fontSize:'44px',marginBottom:'10px' }}>📋</div>
            <div style={{ fontWeight:600,color:'#6B7280',marginBottom:'4px' }}>Aucune rotation pour {labelDate(date)||'cette date'}</div>
            <div style={{ fontSize:'13px',color:'#9CA3AF',marginBottom:'18px' }}>Cliquez sur "+ Ajouter" pour saisir plusieurs camions en une fois</div>
            <button onClick={()=>setModal({mode:'add'})} style={{ display:'inline-flex',alignItems:'center',gap:'8px',padding:'10px 20px',borderRadius:'11px',fontWeight:700,fontSize:'14px',border:'none',background:'linear-gradient(135deg,#004B8D,#0066CC)',color:'white',cursor:'pointer' }}>+ Ajouter des rotations</button>
          </div>
        ):(
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%',borderCollapse:'collapse',fontSize:'13px' }}>
              <thead>
                <tr style={{background:'#0D2B4E'}}>
                  <th colSpan={3} style={{padding:'8px 10px',color:'#64748B',fontSize:'10px',fontWeight:600,borderRight:'2px solid #1E3A5F'}}> </th>
                  <th style={{padding:'8px 12px',textAlign:'center',fontSize:'11px',fontWeight:800,color:'#FDE68A',background:'#1A1500',borderLeft:'3px solid #D97706',whiteSpace:'nowrap'}}>🟡 Stérile P1</th>
                  <th style={{padding:'8px 12px',textAlign:'center',fontSize:'11px',fontWeight:800,color:'#93C5FD',background:'#080F1E',borderLeft:'3px solid #1D4ED8',whiteSpace:'nowrap'}}>🔵 Phosphate P1</th>
                  <th style={{padding:'8px 12px',textAlign:'center',fontSize:'11px',fontWeight:800,color:'#FCA5A5',background:'#1A0800',borderLeft:'3px solid #B45309',whiteSpace:'nowrap'}}>🟠 Stérile P2</th>
                  <th style={{padding:'8px 12px',textAlign:'center',fontSize:'11px',fontWeight:800,color:'#A5B4FC',background:'#06060F',borderLeft:'3px solid #1E40AF',whiteSpace:'nowrap'}}>🟦 Phosphate P2</th>
                  <th colSpan={3} style={{padding:'8px 10px',color:'#64748B',fontSize:'10px',borderLeft:'2px solid #334155'}}> </th>
                </tr>
                <tr style={{background:'#F8FAFC',borderBottom:'2px solid #CBD5E1'}}>
                  <th style={{padding:'8px 10px',textAlign:'left',fontSize:'11px',fontWeight:700,color:'#374151',textTransform:'uppercase',whiteSpace:'nowrap',borderRight:'1px solid #E2E8F0'}}>Camion / Pelles</th>
                  <th style={{padding:'8px 8px',textAlign:'left',fontSize:'11px',fontWeight:700,color:'#374151',textTransform:'uppercase',whiteSpace:'nowrap'}}>Ch. 1er</th>
                  <th style={{padding:'8px 8px',textAlign:'left',fontSize:'11px',fontWeight:700,color:'#374151',textTransform:'uppercase',whiteSpace:'nowrap',borderRight:'2px solid #CBD5E1'}}>Ch. 2e</th>
                  <th style={{padding:'8px 12px',textAlign:'left',fontSize:'10px',fontWeight:700,color:'#D97706',textTransform:'uppercase',background:'#FFFBEB',borderLeft:'3px solid #D97706',whiteSpace:'nowrap'}}>Panneau · km · Vgs</th>
                  <th style={{padding:'8px 12px',textAlign:'left',fontSize:'10px',fontWeight:700,color:'#1D4ED8',textTransform:'uppercase',background:'#EFF6FF',borderLeft:'3px solid #1D4ED8',whiteSpace:'nowrap'}}>Panneau · km · Vgs</th>
                  <th style={{padding:'8px 12px',textAlign:'left',fontSize:'10px',fontWeight:700,color:'#B45309',textTransform:'uppercase',background:'#FEF3C7',borderLeft:'3px solid #B45309',whiteSpace:'nowrap'}}>Panneau · km · Vgs</th>
                  <th style={{padding:'8px 12px',textAlign:'left',fontSize:'10px',fontWeight:700,color:'#1E40AF',textTransform:'uppercase',background:'#EEF2FF',borderLeft:'3px solid #1E40AF',whiteSpace:'nowrap'}}>Panneau · km · Vgs</th>
                  <th style={{padding:'8px 10px',textAlign:'center',fontSize:'11px',fontWeight:700,color:'#374151',textTransform:'uppercase',borderLeft:'2px solid #E2E8F0',whiteSpace:'nowrap'}}>Total</th>
                  <th style={{padding:'8px 8px',textAlign:'left',fontSize:'11px',fontWeight:700,color:'#9CA3AF',textTransform:'uppercase'}}>Note</th>
                  <th style={{padding:'8px 10px',textAlign:'center',fontSize:'11px',fontWeight:700,color:'#9CA3AF',textTransform:'uppercase'}}>Act.</th>
                </tr>
              </thead>
              <tfoot>
                <tr style={{background:'#1A2332'}}>
                  <td colSpan={3} style={{padding:'10px 10px',color:'white',fontWeight:700,fontSize:'13px',borderRight:'2px solid #334155'}}>TOTAL — {rotations.length} camion(s)</td>
                  <td style={{padding:'10px 12px',background:'#1A1500',borderLeft:'3px solid #D97706'}}><span style={{fontWeight:900,color:'#FDE68A',fontSize:'14px'}}>{rotations.reduce((a,r)=>a+(r.sterile_p1a_vgs||0)+(r.sterile_p1b_vgs||0),0)||'—'}</span></td>
                  <td style={{padding:'10px 12px',background:'#080F1E',borderLeft:'3px solid #1D4ED8'}}><span style={{fontWeight:900,color:'#93C5FD',fontSize:'14px'}}>{rotations.reduce((a,r)=>a+(r.phosphate_p1a_vgs||0)+(r.phosphate_p1b_vgs||0),0)||'—'}</span></td>
                  <td style={{padding:'10px 12px',background:'#1A0800',borderLeft:'3px solid #B45309'}}><span style={{fontWeight:900,color:'#FCA5A5',fontSize:'14px'}}>{rotations.reduce((a,r)=>a+(r.sterile_p2a_vgs||0)+(r.sterile_p2b_vgs||0),0)||'—'}</span></td>
                  <td style={{padding:'10px 12px',background:'#06060F',borderLeft:'3px solid #1E40AF'}}><span style={{fontWeight:900,color:'#A5B4FC',fontSize:'14px'}}>{rotations.reduce((a,r)=>a+(r.phosphate_p2a_vgs||0)+(r.phosphate_p2b_vgs||0),0)||'—'}</span></td>
                  <td style={{padding:'10px 10px',textAlign:'center',fontWeight:900,color:'white',fontSize:'15px',borderLeft:'2px solid #334155'}}>{totalVoy||'—'}</td>
                  <td colSpan={2} style={{padding:'10px 8px',color:'#94A3B8',fontSize:'11px',whiteSpace:'nowrap'}}>P: {fmt(volPhos)} m³ · S: {fmt(volSter)} m³ · ∑ {fmt(volPhos+volSter)} m³</td>
                </tr>
              </tfoot>
              <tbody>{rotations.map((r,i)=><RotRow key={r.id} r={r} idx={i} onEdit={row=>setModal({mode:'edit',row})} onDelete={handleDelete} deleting={deleting}/>)}</tbody>
            </table>
          </div>
        )}
      </div>
      {modal?.mode==='add'&&<BulkAddModal date={date} affectations={affectations} pelles={pelles} existingCamions={existingCamions} onSave={handleBulkSaved} onClose={()=>setModal(null)}/>}
      {modal?.mode==='edit'&&<EditModal date={date} row={modal.row} affectations={affectations} pelles={pelles} onSave={handleEditSaved} onClose={()=>setModal(null)}/>}
    </div>
  );
}
