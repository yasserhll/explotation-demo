import { useState, useEffect, useCallback } from 'react';
import { rotationAPI } from '../services/api';

const PANNEAUX = [
  'TG3 2EME SORTIE P7 / DECHARGE','TG3 P7 1ER SORTIE / DECHARGE','TG3 P7 / DECHARGE',
  'TF8 INT 3/4 P5 / DECHARGE','TF8 P5 3/4 / DECHARGE','TF8 C4 P5 / CRIBLAGE MOBILE',
  'TF8 P5 / CRIBLAGE MOBILE','TE9 P5 / DECHARGE','TG4 P7 / TREMIE 1',
  'TG4 P7 / STOCK GOUDRON','TJ9 P6 / CRIBLAGE MOBILE','TJ9 P6 / STOCK PSF',
  'REPRISE PSF / CRIBLAGE MOBILE',
];

const today = () => new Date().toISOString().slice(0,10);
const fmt   = n => Number(n||0).toLocaleString('fr-FR');
const ic    = 'w-full border border-gray-200 rounded-lg bg-gray-50 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400';
const inc   = 'w-full border border-gray-200 rounded-lg bg-gray-50 px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-400';

// ─── Modal Ajout / Édition rotation ──────────────────────────────────────────
function ModalRotation({ date, row, affectations, existingCamions, onSave, onClose }) {
  const isEdit = !!row?.id;
  const dispo  = affectations.filter(a => isEdit ? true : !existingCamions.includes(a.camion_code));
  const initC  = row?.camion_id || dispo[0]?.camion_code || '';
  const initA  = affectations.find(a => a.camion_code === initC);

  const [camion, setCamion] = useState(initC);
  const [f, setF] = useState({
    chauffeur_1er:        row?.chauffeur_1er        || initA?.chauffeur_principal  || '',
    chauffeur_2e:         row?.chauffeur_2e         || initA?.chauffeur_secondaire || '',
    sterile_p1_panneau:   row?.sterile_p1_panneau   || '',
    sterile_p1_km:        row?.sterile_p1_km        || '',
    sterile_p1_vgs:       row?.sterile_p1_vgs       || '',
    phosphate_p1_panneau: row?.phosphate_p1_panneau || '',
    phosphate_p1_km:      row?.phosphate_p1_km      || '',
    phosphate_p1_vgs:     row?.phosphate_p1_vgs     || '',
    sterile_p2_panneau:   row?.sterile_p2_panneau   || '',
    sterile_p2_km:        row?.sterile_p2_km        || '',
    sterile_p2_vgs:       row?.sterile_p2_vgs       || '',
    phosphate_p2_panneau: row?.phosphate_p2_panneau || '',
    phosphate_p2_km:      row?.phosphate_p2_km      || '',
    phosphate_p2_vgs:     row?.phosphate_p2_vgs     || '',
    commentaires:         row?.commentaires         || '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const changeCamion = code => {
    setCamion(code);
    const a = affectations.find(x => x.camion_code === code);
    if (a) setF(p => ({...p, chauffeur_1er: a.chauffeur_principal||'', chauffeur_2e: a.chauffeur_secondaire||''}));
  };
  const u = (k,v) => setF(p => ({...p,[k]:v}));

  const submit = async () => {
    if (!camion) { setErr('Sélectionnez un camion.'); return; }
    setSaving(true); setErr('');
    try {
      const payload = { date, camion_id: camion, ...f };
      if (isEdit) await rotationAPI.update(row.id, payload);
      else        await rotationAPI.create(payload);
      onSave();
    } catch(e) { setErr(e.response?.data?.message || 'Erreur.'); }
    setSaving(false);
  };

  const Sec = ({title, color, children}) => (
    <div className="rounded-xl border p-3 space-y-2" style={{borderColor:color+'50',background:color+'0A'}}>
      <div className="text-xs font-bold uppercase tracking-wide mb-1" style={{color}}>{title}</div>
      {children}
    </div>
  );

  const PRow = ({p,k,v,onP,onK,onV}) => (
    <div className="grid grid-cols-12 gap-1.5">
      <div className="col-span-7">
        <input list="pl" value={p} onChange={e=>onP(e.target.value)} placeholder="Panneau / Destination" className={ic}/>
      </div>
      <div className="col-span-2">
        <input type="number" step="0.1" min="0" value={k} onChange={e=>onK(e.target.value)} placeholder="km" className={inc}/>
      </div>
      <div className="col-span-3">
        <input type="number" min="0" value={v} onChange={e=>onV(e.target.value)} placeholder="Vgs" className={inc}/>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[95vh] overflow-y-auto">

        {/* Header */}
        <div className="px-5 py-4 border-b flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h2 className="font-bold text-gray-900">{isEdit ? 'Modifier la rotation' : 'Ajouter une rotation'}</h2>
            <p className="text-xs text-gray-400 mt-0.5">📅 {date}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center text-sm">✕</button>
        </div>

        <div className="p-5 space-y-4">
          {err && <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg">{err}</div>}

          {/* Camion + Chauffeurs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Camion *</label>
              {isEdit
                ? <div className="font-black text-blue-700 font-mono text-xl px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl text-center">{camion}</div>
                : <select value={camion} onChange={e=>changeCamion(e.target.value)} className={ic}>
                    <option value="">— Choisir —</option>
                    {dispo.map(a=><option key={a.camion_code} value={a.camion_code}>{a.camion_code}</option>)}
                  </select>
              }
            </div>
            <div className="space-y-2">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Chauffeur 1er</label>
                <input value={f.chauffeur_1er} onChange={e=>u('chauffeur_1er',e.target.value)} className={ic} placeholder="Nom"/>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Chauffeur 2e</label>
                <input value={f.chauffeur_2e} onChange={e=>u('chauffeur_2e',e.target.value)} className={ic} placeholder="Nom"/>
              </div>
            </div>
          </div>

          {/* En-têtes colonnes */}
          <div className="grid grid-cols-12 gap-1.5 text-xs text-gray-400 font-semibold px-0.5">
            <div className="col-span-7">Panneau / Destination</div>
            <div className="col-span-2 text-center">km</div>
            <div className="col-span-3 text-center">Voyages</div>
          </div>

          <Sec title="🟡 Stérile — Poste 1" color="#D97706">
            <PRow p={f.sterile_p1_panneau} k={f.sterile_p1_km} v={f.sterile_p1_vgs}
              onP={v=>u('sterile_p1_panneau',v)} onK={v=>u('sterile_p1_km',v)} onV={v=>u('sterile_p1_vgs',v)}/>
          </Sec>
          <Sec title="🔵 Phosphate — Poste 1" color="#2563EB">
            <PRow p={f.phosphate_p1_panneau} k={f.phosphate_p1_km} v={f.phosphate_p1_vgs}
              onP={v=>u('phosphate_p1_panneau',v)} onK={v=>u('phosphate_p1_km',v)} onV={v=>u('phosphate_p1_vgs',v)}/>
          </Sec>
          <Sec title="🟠 Stérile — Poste 2" color="#B45309">
            <PRow p={f.sterile_p2_panneau} k={f.sterile_p2_km} v={f.sterile_p2_vgs}
              onP={v=>u('sterile_p2_panneau',v)} onK={v=>u('sterile_p2_km',v)} onV={v=>u('sterile_p2_vgs',v)}/>
          </Sec>
          <Sec title="🟦 Phosphate — Poste 2" color="#1D4ED8">
            <PRow p={f.phosphate_p2_panneau} k={f.phosphate_p2_km} v={f.phosphate_p2_vgs}
              onP={v=>u('phosphate_p2_panneau',v)} onK={v=>u('phosphate_p2_km',v)} onV={v=>u('phosphate_p2_vgs',v)}/>
          </Sec>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Commentaires</label>
            <textarea value={f.commentaires} onChange={e=>u('commentaires',e.target.value)}
              rows={2} className={ic+' resize-none'} placeholder="Observations, incidents…"/>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t flex gap-3 justify-end sticky bottom-0 bg-white rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">Annuler</button>
          <button onClick={submit} disabled={saving}
            className="px-5 py-2 text-sm font-semibold text-white rounded-xl disabled:opacity-50"
            style={{background:'linear-gradient(135deg,#004B8D,#0066CC)'}}>
            {saving ? 'Sauvegarde…' : isEdit ? 'Modifier' : 'Ajouter'}
          </button>
        </div>
      </div>
      <datalist id="pl">{PANNEAUX.map(v=><option key={v} value={v}/>)}</datalist>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function SaisieJournaliere() {
  const [date,         setDate]         = useState(today());
  const [rotations,    setRotations]    = useState([]);
  const [affectations, setAffectations] = useState([]);
  const [datesExist,   setDatesExist]   = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [modal,        setModal]        = useState(null);
  const [deleting,     setDeleting]     = useState(null);
  const [msg,          setMsg]          = useState(null);

  const flash = (text, ok=true) => { setMsg({text,ok}); setTimeout(()=>setMsg(null),3000); };

  const loadDates = useCallback(async () => {
    try { const r = await rotationAPI.getDates(); setDatesExist(r.data||[]); } catch {}
  },[]);

  const loadRotations = useCallback(async (d) => {
    setLoading(true);
    try {
      const r = await rotationAPI.getByDate(d);
      setRotations(r.data.rotations||[]);
      setAffectations(r.data.affectations||[]);
    } catch {}
    setLoading(false);
  },[]);

  useEffect(()=>{ loadDates(); },[]);
  useEffect(()=>{ loadRotations(date); },[date]);

  const handleSaved = () => { setModal(null); loadRotations(date); loadDates(); flash('✓ Rotation sauvegardée'); };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette rotation ?')) return;
    setDeleting(id);
    try { await rotationAPI.delete(id); loadRotations(date); loadDates(); flash('✓ Supprimé'); }
    catch { flash('Erreur suppression', false); }
    setDeleting(null);
  };

  // Calculs totaux
  const tot      = rotations.reduce((a,r)=>({
    sp1: a.sp1+(r.sterile_p1_vgs||0),
    pp1: a.pp1+(r.phosphate_p1_vgs||0),
    sp2: a.sp2+(r.sterile_p2_vgs||0),
    pp2: a.pp2+(r.phosphate_p2_vgs||0),
  }),{sp1:0,pp1:0,sp2:0,pp2:0});
  const totalVoy = tot.sp1+tot.pp1+tot.sp2+tot.pp2;
  const volPhos  = (tot.pp1+tot.pp2)*16;
  const volSter  = (tot.sp1+tot.sp2)*14;

  const existingCamions = rotations.map(r=>r.camion_id);
  const hasMore = affectations.filter(a=>!existingCamions.includes(a.camion_code)).length > 0;

  const dateLabel = date
    ? new Date(date+'T12:00:00').toLocaleDateString('fr-FR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'})
    : '';

  const Vgs = ({v,color}) => v
    ? <span className="font-bold tabular-nums" style={{color}}>{v}</span>
    : <span className="text-gray-200 text-xs">—</span>;

  return (
    <div className="space-y-4 max-w-full">
      {/* Toast */}
      {msg && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-semibold shadow-xl border ${msg.ok?'bg-green-50 border-green-200 text-green-800':'bg-red-50 border-red-200 text-red-800'}`}>
          {msg.text}
        </div>
      )}

      {/* ── Header ── */}
      <div className="bg-white rounded-2xl border border-gray-100/80 px-5 py-4 space-y-3"
        style={{boxShadow:'0 1px 8px rgba(0,0,0,0.05)'}}>
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Rotation des Chauffeurs</h2>
            <p className="text-xs text-gray-400 capitalize mt-0.5">{dateLabel}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={()=>setDate(today())}
              className={`text-xs px-3 py-2 rounded-xl font-semibold border transition-all ${date===today()?'bg-blue-600 text-white border-blue-600':'border-gray-200 text-gray-600 hover:border-blue-300 bg-gray-50'}`}>
              Aujourd'hui
            </button>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"/>
            {hasMore && (
              <button onClick={()=>setModal({row:null})}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{background:'linear-gradient(135deg,#004B8D,#0066CC)'}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Ajouter
              </button>
            )}
          </div>
        </div>

        {/* Jours saisis */}
        {datesExist.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-gray-50">
            <span className="text-xs text-gray-400 font-medium">Jours saisis :</span>
            {datesExist.slice(0,10).map(d=>(
              <button key={d.date} onClick={()=>setDate(d.date)}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all ${d.date===date?'bg-blue-600 text-white':'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
                {new Date(d.date+'T12:00:00').toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'})}
                <span className="ml-1 opacity-60">·{d.nb_camions}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── KPIs (seulement si des données) ── */}
      {rotations.length > 0 && (
        <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
          {[
            {l:'Camions',      v:rotations.length,         c:'#004B8D',bg:'#EFF6FF',b:'#BFDBFE'},
            {l:'Phosphate m³', v:fmt(volPhos)+' m³',        c:'#1D4ED8',bg:'#DBEAFE',b:'#93C5FD'},
            {l:'Stérile m³',  v:fmt(volSter)+' m³',        c:'#B45309',bg:'#FEF3C7',b:'#FDE68A'},
            {l:'Total voyages',v:fmt(totalVoy),              c:'#7C3AED',bg:'#F5F3FF',b:'#DDD6FE'},
            {l:'m³ total',    v:fmt(volPhos+volSter)+' m³', c:'#00843D',bg:'#F0FDF4',b:'#BBF7D0'},
          ].map((s,i)=>(
            <div key={i} className="rounded-2xl p-4 flex items-center justify-between border"
              style={{background:s.bg,borderColor:s.b}}>
              <span className="text-xs font-semibold" style={{color:s.c}}>{s.l}</span>
              <span className="text-lg font-black tabular-nums" style={{color:s.c}}>{s.v}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Tableau ── */}
      <div className="bg-white rounded-2xl border border-gray-100/80 overflow-hidden"
        style={{boxShadow:'0 1px 8px rgba(0,0,0,0.05)'}}>

        <div className="px-5 py-3 border-b flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">
            {loading ? 'Chargement…'
              : rotations.length > 0 ? `${rotations.length} camion(s) enregistré(s) — ${fmt(totalVoy)} voyages`
              : 'Aucune rotation saisie pour cette date'}
          </span>
          {rotations.length > 0 && hasMore && (
            <button onClick={()=>setModal({row:null})}
              className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100">
              + Camion
            </button>
          )}
        </div>

        {/* État vide */}
        {!loading && rotations.length === 0 && (
          <div className="text-center py-14">
            <div className="text-5xl mb-3">🚛</div>
            <p className="text-sm font-semibold text-gray-500">Aucune rotation pour le {dateLabel}</p>
            <p className="text-xs text-gray-400 mt-1 mb-5">Cliquez sur "Ajouter" pour commencer la saisie</p>
            {hasMore && (
              <button onClick={()=>setModal({row:null})}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{background:'linear-gradient(135deg,#004B8D,#0066CC)'}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Ajouter un camion
              </button>
            )}
          </div>
        )}

        {/* Spinner */}
        {loading && (
          <div className="flex items-center justify-center py-14 text-gray-400 text-sm">
            <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mr-2"/>
            Chargement…
          </div>
        )}

        {/* Tableau données */}
        {!loading && rotations.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{background:'#F8FAFC',borderBottom:'2px solid #F1F5F9'}}>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase whitespace-nowrap sticky left-0 bg-gray-50/90">Camion</th>
                  <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase whitespace-nowrap">Chauffeur 1er</th>
                  <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase whitespace-nowrap">Chauffeur 2e</th>
                  {/* Stérile P1 */}
                  <th className="py-3 px-2 text-xs font-bold uppercase text-left whitespace-nowrap" style={{color:'#D97706',background:'#FEF3C7'}}>Stér. P1</th>
                  <th className="py-3 px-2 text-xs font-bold text-center" style={{color:'#D97706',background:'#FEF3C7'}}>km</th>
                  <th className="py-3 px-2 text-xs font-bold text-center" style={{color:'#D97706',background:'#FEF3C7'}}>Vgs</th>
                  {/* Phosphate P1 */}
                  <th className="py-3 px-2 text-xs font-bold uppercase text-left whitespace-nowrap" style={{color:'#1D4ED8',background:'#DBEAFE'}}>Phos. P1</th>
                  <th className="py-3 px-2 text-xs font-bold text-center" style={{color:'#1D4ED8',background:'#DBEAFE'}}>km</th>
                  <th className="py-3 px-2 text-xs font-bold text-center" style={{color:'#1D4ED8',background:'#DBEAFE'}}>Vgs</th>
                  {/* Stérile P2 */}
                  <th className="py-3 px-2 text-xs font-bold uppercase text-left whitespace-nowrap" style={{color:'#B45309',background:'#FDE68A'}}>Stér. P2</th>
                  <th className="py-3 px-2 text-xs font-bold text-center" style={{color:'#B45309',background:'#FDE68A'}}>km</th>
                  <th className="py-3 px-2 text-xs font-bold text-center" style={{color:'#B45309',background:'#FDE68A'}}>Vgs</th>
                  {/* Phosphate P2 */}
                  <th className="py-3 px-2 text-xs font-bold uppercase text-left whitespace-nowrap" style={{color:'#1E40AF',background:'#BFDBFE'}}>Phos. P2</th>
                  <th className="py-3 px-2 text-xs font-bold text-center" style={{color:'#1E40AF',background:'#BFDBFE'}}>km</th>
                  <th className="py-3 px-2 text-xs font-bold text-center" style={{color:'#1E40AF',background:'#BFDBFE'}}>Vgs</th>
                  <th className="py-3 px-3 text-xs font-bold text-gray-500 uppercase text-left">Commentaires</th>
                  <th className="py-3 px-3 text-xs font-bold text-gray-500 uppercase text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rotations.map((r,i)=>(
                  <tr key={r.id} className={`border-t border-gray-50 hover:bg-blue-50/20 ${i%2?'bg-gray-50/20':''}`}>
                    <td className="py-2.5 px-4 sticky left-0 bg-white">
                      <span className="font-black text-blue-700 font-mono">{r.camion_id}</span>
                    </td>
                    <td className="py-2.5 px-3 text-sm text-gray-700 whitespace-nowrap">{r.chauffeur_1er||'—'}</td>
                    <td className="py-2.5 px-3 text-xs text-gray-500 whitespace-nowrap">{r.chauffeur_2e||'—'}</td>
                    {/* Stér P1 */}
                    <td className="py-2.5 px-2 text-xs text-gray-600 max-w-[120px] truncate" style={{background:'#FEF3C708'}} title={r.sterile_p1_panneau||''}>{r.sterile_p1_panneau||<span className="text-gray-200">—</span>}</td>
                    <td className="py-2.5 px-2 text-center text-xs text-gray-400" style={{background:'#FEF3C708'}}>{r.sterile_p1_km||'—'}</td>
                    <td className="py-2.5 px-2 text-center" style={{background:'#FEF3C708'}}><Vgs v={r.sterile_p1_vgs} color="#D97706"/></td>
                    {/* Phos P1 */}
                    <td className="py-2.5 px-2 text-xs text-gray-600 max-w-[120px] truncate" style={{background:'#DBEAFE08'}} title={r.phosphate_p1_panneau||''}>{r.phosphate_p1_panneau||<span className="text-gray-200">—</span>}</td>
                    <td className="py-2.5 px-2 text-center text-xs text-gray-400" style={{background:'#DBEAFE08'}}>{r.phosphate_p1_km||'—'}</td>
                    <td className="py-2.5 px-2 text-center" style={{background:'#DBEAFE08'}}><Vgs v={r.phosphate_p1_vgs} color="#1D4ED8"/></td>
                    {/* Stér P2 */}
                    <td className="py-2.5 px-2 text-xs text-gray-600 max-w-[120px] truncate" style={{background:'#FDE68A08'}} title={r.sterile_p2_panneau||''}>{r.sterile_p2_panneau||<span className="text-gray-200">—</span>}</td>
                    <td className="py-2.5 px-2 text-center text-xs text-gray-400" style={{background:'#FDE68A08'}}>{r.sterile_p2_km||'—'}</td>
                    <td className="py-2.5 px-2 text-center" style={{background:'#FDE68A08'}}><Vgs v={r.sterile_p2_vgs} color="#B45309"/></td>
                    {/* Phos P2 */}
                    <td className="py-2.5 px-2 text-xs text-gray-600 max-w-[120px] truncate" style={{background:'#BFDBFE08'}} title={r.phosphate_p2_panneau||''}>{r.phosphate_p2_panneau||<span className="text-gray-200">—</span>}</td>
                    <td className="py-2.5 px-2 text-center text-xs text-gray-400" style={{background:'#BFDBFE08'}}>{r.phosphate_p2_km||'—'}</td>
                    <td className="py-2.5 px-2 text-center" style={{background:'#BFDBFE08'}}><Vgs v={r.phosphate_p2_vgs} color="#1E40AF"/></td>
                    {/* Commentaires */}
                    <td className="py-2.5 px-3 text-xs text-gray-400 max-w-[120px] truncate" title={r.commentaires||''}>{r.commentaires||''}</td>
                    {/* Actions */}
                    <td className="py-2.5 px-3">
                      <div className="flex gap-1.5 justify-center">
                        <button onClick={()=>setModal({row:r})}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/>
                          </svg>
                        </button>
                        <button onClick={()=>handleDelete(r.id)} disabled={deleting===r.id}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-40">
                          {deleting===r.id
                            ? <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin"/>
                            : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                              </svg>
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* Ligne totaux */}
              <tfoot>
                <tr style={{background:'#1A2332'}}>
                  <td colSpan={5} className="py-2.5 px-4 text-xs font-bold text-white">
                    TOTAL — {rotations.length} camions
                  </td>
                  <td className="py-2.5 px-2 text-center font-black text-amber-300 text-sm tabular-nums">{tot.sp1||''}</td>
                  <td colSpan={2}/>
                  <td className="py-2.5 px-2 text-center font-black text-blue-300 text-sm tabular-nums">{tot.pp1||''}</td>
                  <td colSpan={2}/>
                  <td className="py-2.5 px-2 text-center font-black text-amber-200 text-sm tabular-nums">{tot.sp2||''}</td>
                  <td colSpan={2}/>
                  <td className="py-2.5 px-2 text-center font-black text-blue-200 text-sm tabular-nums">{tot.pp2||''}</td>
                  <td colSpan={2} className="py-2.5 px-3 text-xs font-bold text-gray-400">
                    {totalVoy > 0 && `${fmt(totalVoy)} vgs · ${fmt(volPhos+volSter)} m³`}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <ModalRotation
          date={date}
          row={modal.row}
          affectations={affectations}
          existingCamions={existingCamions}
          onSave={handleSaved}
          onClose={()=>setModal(null)}
        />
      )}
    </div>
  );
}
