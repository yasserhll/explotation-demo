import { useState, useEffect } from 'react';
import { arretAPI, affectationAPI } from '../services/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const TYPES_ARRET = [
  'Panne mécanique','Panne électrique','Météo (pluie)','Manque carburant',
  'Entretien préventif','Arrêt direction','Attente engin','Autre'
];
const COLORS = ['#EF4444','#F97316','#EAB308','#8B5CF6','#06B6D4','#10B981','#6366F1','#84CC16'];
const inputCls = "w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

function GaugeArc({ value, color }) {
  const r=54, cx=70, cy=68;
  const sa=Math.PI, ea=Math.PI+(Math.min(value,100)/100)*Math.PI;
  const x1=cx+r*Math.cos(sa), y1=cy+r*Math.sin(sa);
  const x2=cx+r*Math.cos(ea), y2=cy+r*Math.sin(ea);
  const large=(ea-sa)>Math.PI?1:0;
  return (
    <svg viewBox="0 0 140 85" className="w-full" style={{maxWidth:'200px'}}>
      <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`} fill="none" stroke="#F1F5F9" strokeWidth="11" strokeLinecap="round"/>
      <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`} fill="none" stroke={color} strokeWidth="11" strokeLinecap="round"/>
      <text x={cx} y={cy-5} textAnchor="middle" fontSize="22" fontWeight="900" fill={color}>{value}%</text>
      <text x={cx} y={cy+12} textAnchor="middle" fontSize="8" fill="#94A3B8" fontWeight="600" letterSpacing="1">DISPONIBILITÉ</text>
    </svg>
  );
}

// Build OCP cycle dates: 27 of prev month to 26 of current
function ocpCycleDates(year, month) {
  const y=parseInt(year), m=parseInt(month);
  const fromDate = new Date(m===1?y-1:y, m===1?11:m-2, 27);
  const toDate   = new Date(y, m-1, 26);
  return {
    from: fromDate.toISOString().slice(0,10),
    to:   toDate.toISOString().slice(0,10),
  };
}

export default function Disponibilite() {
  const today = new Date();
  const initMonth = String(today.getMonth()+1).padStart(2,'0');
  const initYear  = String(today.getFullYear());

  const [viewYear, setViewYear]   = useState(initYear);
  const [viewMonth, setViewMonth] = useState(initMonth);
  const [disponibilite, setDisponibilite] = useState(null);
  const [arrets, setArrets]       = useState([]);
  const [engins, setEngins]       = useState([]);   // from affectations
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState({
    date: today.toISOString().slice(0,10),
    type_arret:'', description:'', duree_heures:'', engin_code:''
  });
  const [saving, setSaving] = useState(false);

  const cycle = ocpCycleDates(viewYear, viewMonth);
  const cycleLabel = (() => {
    const y=parseInt(viewYear), m=parseInt(viewMonth);
    const mPrev = m===1?12:m-1; const yPrev=m===1?y-1:y;
    const months=['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
    return `27 ${months[mPrev-1]} ${yPrev} → 26 ${months[m-1]} ${y}`;
  })();

  const load = () => {
    setLoading(true);
    Promise.all([
      arretAPI.getDisponibilite({ from: cycle.from, to: cycle.to }),
      arretAPI.getAll({ from: cycle.from, to: cycle.to }),
      affectationAPI.getAll(),
    ]).then(([d, a, aff]) => {
      setDisponibilite(d.data);
      setArrets(Array.isArray(a.data) ? a.data : (a.data?.data || []));
      // Extract unique engin codes from affectations
      const affData = Array.isArray(aff.data) ? aff.data : (aff.data?.data || []);
      const codes = [...new Set(affData.map(x => x.camion_code).filter(Boolean))].sort();
      setEngins(codes);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [viewYear, viewMonth]);

  const changeMonth = dir => {
    let y=parseInt(viewYear), m=parseInt(viewMonth)+dir;
    if(m>12){m=1;y++;} if(m<1){m=12;y--;}
    setViewYear(String(y)); setViewMonth(String(m).padStart(2,'0'));
  };

  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true);
    try { await arretAPI.create(form); setShowForm(false); load(); }
    catch(err) { alert('Erreur: ' + (err.response?.data?.message || err.message)); }
    setSaving(false);
  };

  const taux = disponibilite?.taux_disponibilite_global ?? 100;
  const tauxColor = taux>=85 ? '#00843D' : taux>=70 ? '#F59E0B' : '#EF4444';
  const heuresArret = disponibilite?.heures_arret_totales || 0;
  const heuresTheo  = disponibilite?.heures_theoriques_totales || 0;
  const jours = disponibilite?.jours_periode || 0;
  const parType = disponibilite?.par_type_arret || [];
  const pieData = parType.map((a,i) => ({
    name: a.type_arret, value: parseFloat(a.total_heures), color: COLORS[i%COLORS.length]
  })).filter(d => d.value > 0);

  const monthNames = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Cycle selector */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100/80 flex flex-wrap gap-4 items-center justify-between" style={{boxShadow:'0 1px 8px rgba(0,0,0,0.05)'}}>
        <div className="flex items-center gap-3">
          <button onClick={() => changeMonth(-1)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div className="text-center min-w-40">
            <div className="font-bold text-gray-800">{monthNames[parseInt(viewMonth)-1]} {viewYear}</div>
            <div className="text-xs text-blue-600 font-medium mt-0.5">📅 {cycleLabel}</div>
          </div>
          <button onClick={() => changeMonth(1)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
        <div className="text-xs text-gray-400">{cycle.from} → {cycle.to}</div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{background:'linear-gradient(135deg,#F59E0B,#D97706)'}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Enregistrer un Arrêt
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Gauge */}
        <div className="xl:col-span-1 bg-white rounded-2xl p-5 border border-gray-100/80 flex flex-col items-center justify-center" style={{boxShadow:'0 1px 8px rgba(0,0,0,0.05)'}}>
          <GaugeArc value={Math.round(taux)} color={tauxColor}/>
          <div className={`mt-2 text-xs font-bold px-3 py-1 rounded-full ${taux>=85?'bg-green-50 text-green-700':taux>=70?'bg-amber-50 text-amber-700':'bg-red-50 text-red-700'}`}>
            {taux>=85?'✓ Performant':taux>=70?'⚠ À améliorer':'✕ Critique'}
          </div>
        </div>
        {[
          {label:'Heures disponibles', val:Math.round(heuresTheo-heuresArret)+'h', sub:`/${Math.round(heuresTheo)}h théoriques`, color:'#00843D', bg:'#F0FDF4'},
          {label:"Heures d'arrêt", val:heuresArret+'h', sub:`${arrets.length} arrêt(s)`, color:'#EF4444', bg:'#FFF1F2'},
          {label:'Jours période', val:jours, sub:`${disponibilite?.nb_engins||0} engins suivis`, color:'#004B8D', bg:'#EFF6FF'},
        ].map((k,i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100/80" style={{boxShadow:'0 1px 8px rgba(0,0,0,0.05)', background:k.bg}}>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{k.label}</div>
            <div className="text-3xl font-black stat-num" style={{color:k.color}}>{k.val}</div>
            <div className="text-xs text-gray-400 mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Pie chart */}
        {pieData.length > 0 ? (
          <div className="bg-white rounded-2xl p-5 border border-gray-100/80" style={{boxShadow:'0 1px 8px rgba(0,0,0,0.05)'}}>
            <h3 className="font-bold text-gray-800 mb-1">Répartition des Arrêts</h3>
            <p className="text-xs text-gray-400 mb-4">Par type — heures perdues</p>
            <div className="flex gap-4 items-center">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                    {pieData.map((e,i) => <Cell key={i} fill={e.color}/>)}
                  </Pie>
                  <Tooltip formatter={v=>[v+'h','Durée']}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5">
                {pieData.map((d,i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{background:d.color}}/>
                    <span className="flex-1 text-gray-600 truncate">{d.name}</span>
                    <span className="font-bold stat-num">{d.value}h</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-5 border border-gray-100/80 flex items-center justify-center" style={{boxShadow:'0 1px 8px rgba(0,0,0,0.05)'}}>
            <div className="text-center text-gray-400">
              <div className="text-4xl mb-2">📊</div>
              <div className="text-sm font-medium">Aucun arrêt enregistré</div>
              <div className="text-xs mt-1">Saisissez des arrêts pour voir la répartition</div>
            </div>
          </div>
        )}

        {/* Arrets table */}
        <div className="bg-white rounded-2xl border border-gray-100/80 overflow-hidden" style={{boxShadow:'0 1px 8px rgba(0,0,0,0.05)'}}>
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-800">Historique des Arrêts</h3>
              <p className="text-xs text-gray-400 mt-0.5">{arrets.length} entrée(s)</p>
            </div>
            <button onClick={() => setShowForm(true)} className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">+ Ajouter</button>
          </div>
          <div className="overflow-auto max-h-72">
            {loading ? <div className="text-center py-10 text-gray-400 text-sm">Chargement...</div>
            : arrets.length===0 ? <div className="text-center py-10 text-gray-400 text-sm">Aucun arrêt pour cette période</div>
            : (
              <table className="w-full">
                <thead><tr style={{background:'#F8FAFC'}}>
                  {['Date','Type','Engin','Durée',''].map(h=><th key={h} className="text-left py-2.5 px-4 text-xs font-bold text-gray-500 uppercase">{h}</th>)}
                </tr></thead>
                <tbody>
                  {arrets.map(a => (
                    <tr key={a.id} className="border-t border-gray-50 hover:bg-gray-50">
                      <td className="py-2.5 px-4 text-sm text-gray-600">{a.date}</td>
                      <td className="py-2.5 px-4 text-sm font-medium text-gray-800">{a.type_arret}</td>
                      <td className="py-2.5 px-4 text-xs font-semibold text-blue-700">{a.engin_code||'—'}</td>
                      <td className="py-2.5 px-4 text-sm font-bold text-red-600 stat-num">{a.duree_heures}h</td>
                      <td className="py-2.5 px-4">
                        <button onClick={async()=>{if(!confirm('Supprimer ?'))return;await arretAPI.delete(a.id);load();}}
                          className="w-6 h-6 flex items-center justify-center rounded-lg bg-red-50 text-red-400 hover:bg-red-100">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Engin availability per engin */}
      {disponibilite?.par_engin?.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100/80" style={{boxShadow:'0 1px 8px rgba(0,0,0,0.05)'}}>
          <h3 className="font-bold text-gray-800 mb-4">Disponibilité par Engin</h3>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            {disponibilite.par_engin.map((eng,i) => {
              const t = eng.taux_disponibilite ?? 100;
              const c = t>=85?'#00843D':t>=70?'#F59E0B':'#EF4444';
              const bg = t>=85?'#F0FDF4':t>=70?'#FFFBEB':'#FFF1F2';
              return (
                <div key={i} className="rounded-xl p-3 border" style={{background:bg, borderColor:c+'33'}}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-700">{eng.engin_code}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{background:c+'22',color:c}}>{eng.type}</span>
                  </div>
                  <div className="text-2xl font-black stat-num" style={{color:c}}>{t}%</div>
                  <div className="text-xs text-gray-400 mt-1">{eng.heures_arret}h arrêt</div>
                  <div className="h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{width:t+'%', background:c}}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Arret */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Enregistrer un Arrêt</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 text-sm">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">Date *</label>
                <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} required className={inputCls}
                  min={cycle.from} max={cycle.to}/>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">Type d'Arrêt *</label>
                <select value={form.type_arret} onChange={e=>setForm({...form,type_arret:e.target.value})} required className={inputCls}>
                  <option value="">Sélectionner...</option>
                  {TYPES_ARRET.map(t=><option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">Engin concerné</label>
                {/* ✅ Sélection depuis les données d'affectation */}
                <select value={form.engin_code} onChange={e=>setForm({...form,engin_code:e.target.value})} className={inputCls}>
                  <option value="">— Sélectionner un engin —</option>
                  {engins.map(code => (
                    <option key={code} value={code}>{code}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">Durée (heures) *</label>
                <input type="number" step="0.5" min="0.5" max="24" value={form.duree_heures}
                  onChange={e=>setForm({...form,duree_heures:e.target.value})} required className={inputCls} placeholder="Ex: 2.5"/>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">Description</label>
                <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})}
                  rows={2} placeholder="Détails de l'arrêt..." className={inputCls+' resize-none'}/>
              </div>
              <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl">Annuler</button>
                <button type="submit" disabled={saving} className="px-5 py-2 text-sm font-semibold text-white rounded-xl disabled:opacity-50"
                  style={{background:'linear-gradient(135deg,#F59E0B,#D97706)'}}>
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
