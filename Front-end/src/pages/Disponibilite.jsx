import { useState, useEffect } from 'react';
import { arretAPI, affectationAPI } from '../services/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const TYPES_ARRET = [
  'Panne mécanique',
  'Panne électrique',
  'Météo (pluie)',
  'Manque carburant',
  'Entretien préventif',
  'Arrêt direction',
  'Attente engin',
  'Crevé',
  'Visite technique',
  'Accident',
  'Absence chauffeur',
  'Autre',
];
const COLORS = ['#EF4444','#F97316','#EAB308','#8B5CF6','#06B6D4','#10B981','#6366F1','#84CC16','#F43F5E','#A3E635'];
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

function ocpCycleDates(year, month) {
  const y=parseInt(year), m=parseInt(month);
  const fromDate = new Date(m===1?y-1:y, m===1?11:m-2, 27);
  const toDate   = new Date(y, m-1, 26);
  return {
    from: fromDate.toISOString().slice(0,10),
    to:   toDate.toISOString().slice(0,10),
  };
}

// Badge type engin
function TypeBadge({ type }) {
  const cfg = {
    'CAMION':    { bg:'#EFF6FF', c:'#1D4ED8', label:'Camion' },
    'TOMBEREAU': { bg:'#F0FDF4', c:'#166534', label:'Tombereau' },
    'PELLE':     { bg:'#FEF3C7', c:'#92400E', label:'Pelle' },
    'NIVELEUSE': { bg:'#F5F3FF', c:'#6D28D9', label:'Niveleuse' },
    'CHARGEUSE': { bg:'#FFF1F2', c:'#BE123C', label:'Chargeuse' },
  }[type?.toUpperCase()] || { bg:'#F8FAFC', c:'#475569', label: type||'—' };
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{background:cfg.bg, color:cfg.c}}>
      {cfg.label}
    </span>
  );
}

export default function Disponibilite() {
  const today = new Date();
  const initMonth = String(today.getMonth()+1).padStart(2,'0');
  const initYear  = String(today.getFullYear());

  const [viewYear, setViewYear]   = useState(initYear);
  const [viewMonth, setViewMonth] = useState(initMonth);
  const [disponibilite, setDisponibilite] = useState(null);
  const [arrets, setArrets]       = useState([]);
  // allMachines = [ { code, type, label, chauffeur_principal, chauffeur_secondaire } ]
  const [allMachines, setAllMachines] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState({
    date: today.toISOString().slice(0,10),
    type_arret:'', description:'', duree_heures:'',
  });
  // Multi-machine selection
  const [selectedMachines, setSelectedMachines] = useState([]);
  const [machineFilter, setMachineFilter] = useState('');
  const [saving, setSaving] = useState(false);
  const [filterType, setFilterType] = useState('all'); // all | camion | engin

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
      affectationAPI.getEngins(),
    ]).then(([d, a, aff, eng]) => {
      setDisponibilite(d.data);
      setArrets(Array.isArray(a.data) ? a.data : (a.data?.data || []));

      // Build unified machine list: camions + engins de chantier
      const affData = Array.isArray(aff.data) ? aff.data : (aff.data?.data || []);
      const engData = Array.isArray(eng.data) ? eng.data : (eng.data?.data || []);

      const camions = affData.map(x => ({
        code: x.camion_code,
        type: x.type_vehicule?.toUpperCase() === 'TOMBEREAU' ? 'TOMBEREAU' : 'CAMION',
        label: `${x.camion_code} — ${x.chauffeur_principal || '—'}`,
        chauffeur_principal: x.chauffeur_principal,
        chauffeur_secondaire: x.chauffeur_secondaire,
        statut: x.statut,
      })).filter(x => x.code);

      const engins = engData.map(x => ({
        code: x.code,
        type: x.type?.toUpperCase() || 'ENGIN',
        label: `${x.code} — ${x.type} ${x.modele||''}`.trim(),
        chauffeur_principal: x.chauffeur_principal,
        chauffeur_secondaire: x.chauffeur_secondaire,
        statut: x.statut,
      })).filter(x => x.code);

      // Deduplicate by code
      const seen = new Set();
      const all = [...camions, ...engins].filter(m => {
        if (seen.has(m.code)) return false;
        seen.add(m.code); return true;
      }).sort((a,b) => a.code.localeCompare(b.code));

      setAllMachines(all);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [viewYear, viewMonth]);

  const changeMonth = dir => {
    let y=parseInt(viewYear), m=parseInt(viewMonth)+dir;
    if(m>12){m=1;y++;} if(m<1){m=12;y--;}
    setViewYear(String(y)); setViewMonth(String(m).padStart(2,'0'));
  };

  // When engin_code is selected in form, we can show its drivers
  const selectedMachine = selectedMachines.length === 1
    ? allMachines.find(m => m.code === selectedMachines[0])
    : null;

  // Toggle one machine
  const toggleMachine = (code) => {
    setSelectedMachines(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };
  // Select/deselect all visible (filtered) machines
  const toggleAll = (machines) => {
    const codes = machines.map(m => m.code);
    const allSelected = codes.every(c => selectedMachines.includes(c));
    if (allSelected) {
      setSelectedMachines(prev => prev.filter(c => !codes.includes(c)));
    } else {
      setSelectedMachines(prev => [...new Set([...prev, ...codes])]);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (selectedMachines.length === 0) {
      alert('Sélectionnez au moins une machine.');
      return;
    }
    setSaving(true);
    try {
      // Créer un arrêt pour chaque machine sélectionnée
      await Promise.all(
        selectedMachines.map(code =>
          arretAPI.create({ ...form, engin_code: code })
        )
      );
      setShowForm(false);
      load();
    } catch(err) {
      alert('Erreur: ' + (err.response?.data?.message || err.message));
    }
    setSaving(false);
  };

  const openForm = (machine = null) => {
    setForm({
      date: today.toISOString().slice(0,10),
      type_arret:'', description:'', duree_heures:'',
    });
    setSelectedMachines(machine ? [machine.code] : []);
    setMachineFilter('');
    setShowForm(true);
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

  // Per-machine taux from API
  const parEnginMap = {};
  (disponibilite?.par_engin||[]).forEach(e => { parEnginMap[e.engin_code] = e; });

  // Filter machines for display
  const filteredMachines = allMachines.filter(m => {
    if (filterType === 'camion') return m.type === 'CAMION' || m.type === 'TOMBEREAU';
    if (filterType === 'engin')  return m.type !== 'CAMION' && m.type !== 'TOMBEREAU';
    return true;
  });

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
        <button onClick={() => openForm()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{background:'linear-gradient(135deg,#F59E0B,#D97706)'}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Enregistrer un Arrêt
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="xl:col-span-1 bg-white rounded-2xl p-5 border border-gray-100/80 flex flex-col items-center justify-center" style={{boxShadow:'0 1px 8px rgba(0,0,0,0.05)'}}>
          <GaugeArc value={Math.round(taux)} color={tauxColor}/>
          <div className={`mt-2 text-xs font-bold px-3 py-1 rounded-full ${taux>=85?'bg-green-50 text-green-700':taux>=70?'bg-amber-50 text-amber-700':'bg-red-50 text-red-700'}`}>
            {taux>=85?'✓ Performant':taux>=70?'⚠ À améliorer':'✕ Critique'}
          </div>
        </div>
        {[
          {label:'Heures disponibles', val:Math.round(heuresTheo-heuresArret)+'h', sub:`/${Math.round(heuresTheo)}h théoriques`, color:'#00843D', bg:'#F0FDF4'},
          {label:"Heures d'arrêt", val:heuresArret+'h', sub:`${arrets.length} arrêt(s)`, color:'#EF4444', bg:'#FFF1F2'},
          {label:'Parc total', val:allMachines.length, sub:`${allMachines.filter(m=>m.type==='CAMION'||m.type==='TOMBEREAU').length} camions · ${allMachines.filter(m=>m.type!=='CAMION'&&m.type!=='TOMBEREAU').length} engins`, color:'#004B8D', bg:'#EFF6FF'},
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
            <button onClick={() => openForm()} className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">+ Ajouter</button>
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
                      <td className="py-2.5 px-4">
                        {a.engin_code ? (
                          <div>
                            <span className="text-xs font-bold text-blue-700 font-mono">{a.engin_code}</span>
                            {allMachines.find(m=>m.code===a.engin_code) && (
                              <div className="text-xs text-gray-400 mt-0.5">{allMachines.find(m=>m.code===a.engin_code)?.chauffeur_principal || ''}</div>
                            )}
                          </div>
                        ) : <span className="text-gray-400 text-xs">—</span>}
                      </td>
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

      {/* ALL Machines availability grid */}
      <div className="bg-white rounded-2xl border border-gray-100/80 overflow-hidden" style={{boxShadow:'0 1px 8px rgba(0,0,0,0.05)'}}>
        <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-gray-800">Disponibilité par Machine</h3>
            <p className="text-xs text-gray-400 mt-0.5">Camions + Engins de chantier — {allMachines.length} machines</p>
          </div>
          {/* Filter tabs */}
          <div className="flex gap-1.5 bg-gray-100 rounded-xl p-1">
            {[['all','Tous'],['camion','Camions'],['engin','Engins']].map(([v,l])=>(
              <button key={v} onClick={()=>setFilterType(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterType===v?'bg-white text-blue-700 shadow-sm':'text-gray-500 hover:text-gray-700'}`}>{l}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-400 text-sm">Chargement...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr style={{background:'#F8FAFC', borderBottom:'2px solid #F1F5F9'}}>
                <th className="text-left py-2.5 px-4 text-xs font-bold text-gray-500 uppercase">Code</th>
                <th className="text-left py-2.5 px-4 text-xs font-bold text-gray-500 uppercase">Type</th>
                <th className="text-left py-2.5 px-4 text-xs font-bold text-gray-500 uppercase">Conducteur 1er</th>
                <th className="text-left py-2.5 px-4 text-xs font-bold text-gray-500 uppercase">Conducteur 2e</th>
                <th className="text-left py-2.5 px-4 text-xs font-bold text-gray-500 uppercase">Statut</th>
                <th className="text-right py-2.5 px-4 text-xs font-bold text-gray-500 uppercase">H. Arrêt</th>
                <th className="text-left py-2.5 px-4 text-xs font-bold text-gray-500 uppercase">Disponibilité</th>
                <th className="text-left py-2.5 px-4 text-xs font-bold text-gray-500 uppercase">Action</th>
              </tr></thead>
              <tbody>
                {filteredMachines.map((m, i) => {
                  const eng = parEnginMap[m.code];
                  const t   = eng?.taux_disponibilite ?? 100;
                  const hA  = eng?.heures_arret ?? 0;
                  const barColor = t>=85?'#00843D':t>=70?'#F59E0B':'#EF4444';
                  const statusCfg = {
                    actif:       { bg:'#F0FDF4', text:'#166534', dot:'#22C55E', label:'Actif' },
                    arret:       { bg:'#F8FAFC', text:'#475569', dot:'#94A3B8', label:'Arrêt' },
                    en_panne:    { bg:'#FFF1F2', text:'#BE123C', dot:'#EF4444', label:'En panne' },
                    maintenance: { bg:'#FFFBEB', text:'#B45309', dot:'#F59E0B', label:'Maintenance' },
                  }[m.statut] || { bg:'#F0FDF4', text:'#166534', dot:'#22C55E', label:'Actif' };

                  return (
                    <tr key={m.code} className={`border-t border-gray-50 hover:bg-blue-50/20 ${i%2===0?'':'bg-gray-50/30'}`}>
                      <td className="py-2.5 px-4 font-bold text-sm text-blue-700 font-mono">{m.code}</td>
                      <td className="py-2.5 px-4"><TypeBadge type={m.type}/></td>
                      <td className="py-2.5 px-4 text-sm text-gray-700">{m.chauffeur_principal||'—'}</td>
                      <td className="py-2.5 px-4 text-xs text-gray-500">{m.chauffeur_secondaire||'—'}</td>
                      <td className="py-2.5 px-4">
                        <span className="flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full w-fit"
                          style={{background:statusCfg.bg,color:statusCfg.text}}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{background:statusCfg.dot}}/>
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-sm font-bold text-right stat-num" style={{color:hA>0?'#EF4444':'#94A3B8'}}>
                        {hA>0 ? hA+'h' : '0h'}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden" style={{minWidth:'60px'}}>
                            <div className="h-full rounded-full transition-all" style={{width:t+'%', background:barColor}}/>
                          </div>
                          <span className="text-xs font-bold w-10 text-right stat-num" style={{color:barColor}}>{t}%</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <button onClick={() => openForm(m)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                          Arrêt
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Arret — multi-machine */}
      {showForm && (() => {
        // Machines filtrées par la recherche dans le modal
        const camionsList = allMachines.filter(m => m.type==='CAMION'||m.type==='TOMBEREAU');
        const enginsList  = allMachines.filter(m => m.type!=='CAMION'&&m.type!=='TOMBEREAU');
        const filterFn = m => !machineFilter || m.code.toLowerCase().includes(machineFilter.toLowerCase()) || (m.chauffeur_principal||'').toLowerCase().includes(machineFilter.toLowerCase());
        const visibleCamions = camionsList.filter(filterFn);
        const visibleEngins  = enginsList.filter(filterFn);
        const allVisible     = [...visibleCamions, ...visibleEngins];
        const allVisibleSelected = allVisible.length > 0 && allVisible.every(m => selectedMachines.includes(m.code));
        const someSelected   = selectedMachines.length > 0;

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

              {/* Header */}
              <div className="p-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">Enregistrer un Arrêt</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {someSelected
                      ? <span className="text-amber-600 font-semibold">{selectedMachines.length} machine(s) sélectionnée(s)</span>
                      : 'Sélectionnez une ou plusieurs machines'}
                  </p>
                </div>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 text-sm hover:bg-gray-200">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="flex flex-1 overflow-hidden">

                  {/* Colonne gauche — sélection machines */}
                  <div className="w-72 border-r border-gray-100 flex flex-col flex-shrink-0">
                    <div className="p-3 border-b border-gray-50">
                      {/* Recherche */}
                      <input
                        type="text" value={machineFilter}
                        onChange={e => setMachineFilter(e.target.value)}
                        placeholder="🔍 Rechercher..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400 mb-2"
                      />
                      {/* Tout sélectionner */}
                      <label className="flex items-center gap-2 cursor-pointer px-1 py-1 rounded-lg hover:bg-gray-50 select-none">
                        <input
                          type="checkbox"
                          checked={allVisibleSelected}
                          onChange={() => toggleAll(allVisible)}
                          className="w-4 h-4 rounded accent-blue-600"
                        />
                        <span className="text-xs font-bold text-gray-600">
                          {allVisibleSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
                        </span>
                        <span className="ml-auto text-xs text-gray-400">{allVisible.length}</span>
                      </label>
                    </div>

                    {/* Liste machines scrollable */}
                    <div className="overflow-y-auto flex-1 p-2">
                      {/* Camions */}
                      {visibleCamions.length > 0 && (
                        <>
                          <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">🚛 Camions</span>
                            <button type="button" onClick={() => toggleAll(visibleCamions)}
                              className="ml-auto text-xs text-blue-500 font-semibold hover:text-blue-700">
                              {visibleCamions.every(m => selectedMachines.includes(m.code)) ? 'Aucun' : 'Tous'}
                            </button>
                          </div>
                          {visibleCamions.map(m => {
                            const checked = selectedMachines.includes(m.code);
                            return (
                              <label key={m.code} className={`flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer select-none transition-colors ${checked ? 'bg-amber-50 border border-amber-200' : 'hover:bg-gray-50'}`}>
                                <input type="checkbox" checked={checked} onChange={() => toggleMachine(m.code)} className="w-4 h-4 rounded accent-amber-500"/>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-bold text-blue-700 font-mono">{m.code}</div>
                                  <div className="text-xs text-gray-400 truncate">{m.chauffeur_principal || '—'}</div>
                                </div>
                              </label>
                            );
                          })}
                        </>
                      )}

                      {/* Engins */}
                      {visibleEngins.length > 0 && (
                        <>
                          <div className="flex items-center gap-2 px-2 py-1.5 mt-2 mb-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">🔧 Engins</span>
                            <button type="button" onClick={() => toggleAll(visibleEngins)}
                              className="ml-auto text-xs text-blue-500 font-semibold hover:text-blue-700">
                              {visibleEngins.every(m => selectedMachines.includes(m.code)) ? 'Aucun' : 'Tous'}
                            </button>
                          </div>
                          {visibleEngins.map(m => {
                            const checked = selectedMachines.includes(m.code);
                            return (
                              <label key={m.code} className={`flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer select-none transition-colors ${checked ? 'bg-amber-50 border border-amber-200' : 'hover:bg-gray-50'}`}>
                                <input type="checkbox" checked={checked} onChange={() => toggleMachine(m.code)} className="w-4 h-4 rounded accent-amber-500"/>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-bold text-purple-700 font-mono">{m.code}</div>
                                  <div className="text-xs text-gray-400 truncate">{m.type} {m.chauffeur_principal ? `— ${m.chauffeur_principal}` : ''}</div>
                                </div>
                              </label>
                            );
                          })}
                        </>
                      )}

                      {allVisible.length === 0 && (
                        <div className="text-center py-6 text-xs text-gray-400">Aucun résultat</div>
                      )}
                    </div>

                    {/* Récap sélection */}
                    {someSelected && (
                      <div className="p-3 border-t border-gray-100 bg-amber-50">
                        <div className="text-xs font-semibold text-amber-700 mb-1.5">
                          {selectedMachines.length} machine(s) :
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {selectedMachines.map(code => (
                            <span key={code} className="inline-flex items-center gap-1 text-xs bg-white border border-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-mono font-bold">
                              {code}
                              <button type="button" onClick={() => toggleMachine(code)} className="text-amber-400 hover:text-amber-700 font-sans">×</button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Colonne droite — champs arrêt */}
                  <div className="flex-1 overflow-y-auto p-5 space-y-4">

                    {!someSelected && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 font-medium">
                        ⬅ Sélectionnez au moins une machine
                      </div>
                    )}

                    {/* Conducteur info si une seule machine */}
                    {selectedMachine && (
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
                        <span className="font-semibold">Conducteurs :</span>{' '}
                        {selectedMachine.chauffeur_principal || '—'} / {selectedMachine.chauffeur_secondaire || '—'}
                      </div>
                    )}

                    <div>
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">Date *</label>
                      <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} required className={inputCls}
                        min={cycle.from} max={cycle.to}/>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">Type d'Arrêt *</label>
                      <select value={form.type_arret} onChange={e=>setForm({...form,type_arret:e.target.value})} required className={inputCls}>
                        <option value="">— Sélectionner —</option>
                        {TYPES_ARRET.map(t=><option key={t} value={t}>{t}</option>)}
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
                        rows={3} placeholder="Détails de l'arrêt..." className={inputCls+' resize-none'}/>
                    </div>

                    {/* Résumé si multi */}
                    {selectedMachines.length > 1 && form.type_arret && form.duree_heures && (
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-600">
                        <div className="font-semibold text-gray-700 mb-1">📋 Résumé :</div>
                        <div>{selectedMachines.length} arrêts de type <b>{form.type_arret}</b> seront créés</div>
                        <div>Durée : <b>{form.duree_heures}h</b> chacun — Total : <b>{(parseFloat(form.duree_heures||0)*selectedMachines.length).toFixed(1)}h</b></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 justify-end p-5 border-t border-gray-100 flex-shrink-0">
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">
                    Annuler
                  </button>
                  <button type="submit" disabled={saving || !someSelected}
                    className="px-5 py-2 text-sm font-semibold text-white rounded-xl disabled:opacity-40 transition-opacity"
                    style={{background:'linear-gradient(135deg,#F59E0B,#D97706)'}}>
                    {saving
                      ? 'Enregistrement...'
                      : selectedMachines.length > 1
                        ? `Enregistrer ${selectedMachines.length} arrêts`
                        : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
