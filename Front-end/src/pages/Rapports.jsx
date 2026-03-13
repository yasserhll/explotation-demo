import { useState, useEffect } from 'react';
import { rotationAPI } from '../services/api';
import { exportRapportMensuelPDF, exportRapportHebdoPDF } from '../utils/pdfExport';
import {
  ComposedChart, Bar, Line, Area, AreaChart,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts';

const fmt = n => Number(n||0).toLocaleString('fr-FR');

function ocpMonthRange(year, month) {
  const y=parseInt(year), m=parseInt(month);
  return {
    from: new Date(m===1?y-1:y, m===1?11:m-2, 27).toISOString().slice(0,10),
    to:   new Date(y, m-1, 26).toISOString().slice(0,10),
  };
}

function buildWeeks(daily) {
  if (!daily.length) return [];
  const weeks = [];
  let week = { label:'', days:[], vol_phosphate:0, vol_sterile:0, total_volume:0, total_voyages:0 };
  daily.forEach((d, i) => {
    week.days.push(d);
    week.vol_phosphate += parseFloat(d.volume_phosphate)||0;
    week.vol_sterile   += parseFloat(d.volume_sterile)||0;
    week.total_volume  += parseFloat(d.total_volume)||0;
    week.total_voyages += parseInt(d.total_voyages)||0;
    if (week.days.length===7 || i===daily.length-1) {
      const first = week.days[0].date?.slice(5);
      const last  = week.days[week.days.length-1].date?.slice(5);
      week.label = `${first}→${last}`;
      week.from  = week.days[0].date;
      week.to    = week.days[week.days.length-1].date;
      weeks.push({...week});
      week = { label:'', days:[], vol_phosphate:0, vol_sterile:0, total_volume:0, total_voyages:0 };
    }
  });
  return weeks;
}

const MONTH_NAMES = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg text-xs">
      <p className="font-bold text-gray-700 mb-2">{label}</p>
      {payload.map((p,i) => (
        <div key={i} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background:p.color||p.stroke}}/>
          <span className="text-gray-600">{p.name}:</span>
          <span className="font-bold">{Number(p.value).toLocaleString('fr-FR')}{p.name?.includes('m³')||p.name?.includes('Volume')?' m³':''}</span>
        </div>
      ))}
    </div>
  );
};

function RapportTypeCard({ icon, title, desc, active, onClick }) {
  return (
    <button onClick={onClick}
      className={`flex-1 p-4 rounded-2xl border-2 text-left transition-all ${active?'border-blue-600 bg-blue-50/60':'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/50'}`}
      style={active?{boxShadow:'0 0 0 3px rgba(0,75,141,0.12)'}:{boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className={`text-sm font-bold ${active?'text-blue-700':'text-gray-800'}`}>{title}</div>
      <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
    </button>
  );
}

export default function Rapports() {
  const today = new Date();
  const [reportType, setReportType] = useState('month');
  const [viewYear,  setViewYear]  = useState(String(today.getFullYear()));
  const [viewMonth, setViewMonth] = useState(String(today.getMonth()+1).padStart(2,'0'));
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [periodMode, setPeriodMode] = useState('month');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo,   setCustomTo]   = useState('');
  const [activeMonth, setActiveMonth] = useState('');

  const monthLabel = `${MONTH_NAMES[parseInt(viewMonth)-1]} ${viewYear}`;
  const cycleLabel = (() => {
    const y=parseInt(viewYear), m=parseInt(viewMonth);
    const mp=m===1?12:m-1; const yp=m===1?y-1:y;
    return `27 ${MONTH_NAMES[mp-1].slice(0,3)} ${yp} → 26 ${MONTH_NAMES[m-1].slice(0,3)} ${y}`;
  })();

  const changeMonth = dir => {
    let y=parseInt(viewYear), m=parseInt(viewMonth)+dir;
    if(m>12){m=1;y++;} if(m<1){m=12;y--;}
    setViewYear(String(y)); setViewMonth(String(m).padStart(2,'0'));
  };

  useEffect(() => {
    setLoading(true);
    const monthParam = `${viewYear}-${viewMonth}`;
    rotationAPI.getMonthly(monthParam)
      .then(r => { setData(r.data); setActiveMonth(r.data.month||monthParam); setLoading(false); })
      .catch(() => setLoading(false));
  }, [viewYear, viewMonth]);

  const daily = data?.daily_summary || [];
  const weeks = buildWeeks(daily);

  const weeklyTableData = weeks.map((w,i) => ({
    num: i+1,
    from: w.from,
    to: w.to,
    label: w.label,
    jours: w.days.filter(d=>parseFloat(d.total_volume)>0).length,
    vol_phosphate: Math.round(w.vol_phosphate),
    vol_sterile: Math.round(w.vol_sterile),
    total_volume: Math.round(w.total_volume),
    total_voyages: w.total_voyages,
    eff: w.total_voyages>0 ? Math.round(w.total_volume/w.total_voyages) : 0,
    daily: w.days,
  }));

  const chartData = (() => {
    const src = periodMode==='month' ? daily
      : periodMode==='week' ? weeks.map(w=>({date:w.label,...w}))
      : (!customFrom||!customTo) ? daily : daily.filter(d=>d.date>=customFrom&&d.date<=customTo);
    if (periodMode==='week') {
      return weeks.map(w=>({ label:w.label, 'Phosphate m³':Math.round(w.vol_phosphate), 'Stérile m³':Math.round(w.vol_sterile), 'Total m³':Math.round(w.total_volume), 'Voyages':w.total_voyages, eff:w.total_voyages>0?Math.round(w.total_volume/w.total_voyages):0 }));
    }
    return src.map(d=>({ label:d.date?.slice(5)||d.label, 'Phosphate m³':parseFloat(d.volume_phosphate)||0, 'Stérile m³':parseFloat(d.volume_sterile)||0, 'Total m³':parseFloat(d.total_volume)||0, 'Voyages':parseInt(d.total_voyages)||0, eff:d.total_voyages>0?Math.round(d.total_volume/d.total_voyages):0 }));
  })();

  let cumul=0;
  const chartWithCumul = chartData.map(d=>{cumul+=d['Total m³'];return{...d,'Cumul m³':Math.round(cumul)};});

  const periodTotals = chartData.reduce((a,d)=>({vol_phos:a.vol_phos+d['Phosphate m³'],vol_ster:a.vol_ster+d['Stérile m³'],total:a.total+d['Total m³'],voyages:a.voyages+d['Voyages']}),{vol_phos:0,vol_ster:0,total:0,voyages:0});

  return (
    <div className="space-y-5 max-w-7xl mx-auto">

      {/* Controls */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100/80 space-y-4" style={{boxShadow:'0 1px 8px rgba(0,0,0,0.05)'}}>
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={()=>changeMonth(-1)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div className="text-center min-w-36">
              <div className="font-bold text-gray-800">{monthLabel}</div>
              <div className="text-xs text-blue-600 font-medium">{cycleLabel}</div>
            </div>
            <button onClick={()=>changeMonth(1)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
          <div className="flex gap-1.5 bg-gray-100 rounded-xl p-1">
            {[['month','Par Mois'],['week','Par Semaine'],['custom','Période libre']].map(([m,l])=>(
              <button key={m} onClick={()=>setPeriodMode(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${periodMode===m?'bg-white text-blue-700 shadow-sm':'text-gray-500 hover:text-gray-700'}`}>{l}</button>
            ))}
          </div>
          {periodMode==='custom'&&(
            <div className="flex gap-2 items-center">
              <input type="date" value={customFrom} onChange={e=>setCustomFrom(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm" style={{width:'145px'}}/>
              <span className="text-gray-400">→</span>
              <input type="date" value={customTo} onChange={e=>setCustomTo(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm" style={{width:'145px'}}/>
            </div>
          )}
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Type de rapport à générer :</p>
          <div className="flex gap-3">
            <RapportTypeCard icon="📄" title="Rapport Journalier" desc="Une journée + rotation chauffeurs" active={reportType==='day'} onClick={()=>setReportType('day')}/>
            <RapportTypeCard icon="📅" title="Rapport Hebdomadaire" desc="Synthèse semaine par semaine (7 jours)" active={reportType==='week'} onClick={()=>setReportType('week')}/>
            <RapportTypeCard icon="📊" title="Rapport Mensuel" desc="Bilan complet du cycle OCP (27→26)" active={reportType==='month'} onClick={()=>setReportType('month')}/>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/></div>
      ) : !data ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-600">Erreur de chargement</div>
      ) : (
        <>
          {/* KPI */}
          <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
            {[{l:'Phosphate',v:fmt(periodTotals.vol_phos)+' m³',c:'#004B8D',bg:'#EFF6FF',b:'#BFDBFE'},{l:'Stérile',v:fmt(periodTotals.vol_ster)+' m³',c:'#B45309',bg:'#FFFBEB',b:'#FDE68A'},{l:'Volume Total',v:fmt(periodTotals.total)+' m³',c:'#00843D',bg:'#F0FDF4',b:'#BBF7D0'},{l:'Total Voyages',v:fmt(periodTotals.voyages),c:'#7C3AED',bg:'#F5F3FF',b:'#DDD6FE'},{l:'Jours travaillés',v:(periodMode==='month'?data?.jours_production:chartData.length)||0,c:'#374151',bg:'#F9FAFB',b:'#E5E7EB'}].map((k,i)=>(
              <div key={i} className="rounded-2xl p-4" style={{background:k.bg,border:`1px solid ${k.b}`}}>
                <div className="text-xs font-semibold mb-2" style={{color:k.c}}>{k.l}</div>
                <div className="text-xl font-black stat-num" style={{color:k.c}}>{k.v}</div>
              </div>
            ))}
          </div>

          {/* JOURNALIER */}
          {reportType==='day' && (
            <div className="bg-white rounded-2xl border border-gray-100/80 overflow-hidden" style={{boxShadow:'0 1px 8px rgba(0,0,0,0.05)'}}>
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-800">Journées du mois — {monthLabel}</h3>
                <p className="text-xs text-gray-400 mt-0.5">Le rapport journalier complet (avec rotation chauffeurs) se génère depuis la page <strong>Rotation Chauffeurs</strong></p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr style={{background:'#0D2B4E'}}>
                    {['Date','Phosphate m³','Stérile m³','Total m³','Voyages','m³/vg','Statut'].map(c=>(
                      <th key={c} className="text-left py-2.5 px-4 text-xs font-semibold text-gray-300 uppercase">{c}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {daily.map((row,i)=>{
                      const low=parseFloat(row.volume_phosphate)<3000&&parseFloat(row.volume_phosphate)>0;
                      const eff=row.total_voyages>0?Math.round(row.total_volume/row.total_voyages):0;
                      return (
                        <tr key={i} className={`border-t border-gray-50 hover:bg-blue-50/20 ${low?'bg-red-50/40':i%2===0?'':'bg-gray-50/40'}`}>
                          <td className="py-2.5 px-4 text-sm font-medium text-gray-700">{row.date}{low&&<span className="text-xs text-red-400 ml-1">⚠</span>}</td>
                          <td className="py-2.5 px-4 text-sm font-bold stat-num" style={{color:'#004B8D'}}>{fmt(row.volume_phosphate)}</td>
                          <td className="py-2.5 px-4 text-sm stat-num" style={{color:'#B45309'}}>{fmt(row.volume_sterile)}</td>
                          <td className="py-2.5 px-4 text-sm font-bold stat-num">{fmt(row.total_volume)}</td>
                          <td className="py-2.5 px-4 text-sm stat-num">{fmt(row.total_voyages)}</td>
                          <td className={`py-2.5 px-4 text-sm font-bold stat-num ${eff>=14?'text-green-600':eff>0?'text-red-500':'text-gray-400'}`}>{eff||'—'}</td>
                          <td className="py-2.5 px-4">{row.total_volume>0?<span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Produit</span>:<span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">Vide</span>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* HEBDOMADAIRE */}
          {reportType==='week' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100/80 overflow-hidden" style={{boxShadow:'0 1px 8px rgba(0,0,0,0.05)'}}>
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-800">Synthèse Hebdomadaire — {monthLabel}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{weeks.length} semaine(s) dans ce cycle</p>
                  </div>
                  <button onClick={()=>exportRapportHebdoPDF({weeks:weeklyTableData,month:activeMonth,daily,monthLabel,cycleLabel})}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90"
                    style={{background:'linear-gradient(135deg,#7C3AED,#6D28D9)'}}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    Rapport Mensuel Hebdo PDF
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr style={{background:'#F8FAFC',borderBottom:'2px solid #F1F5F9'}}>
                      {['Sem.','Période','Jours','Phosphate m³','Stérile m³','Total m³','Voyages','m³/vg','PDF'].map(c=>(
                        <th key={c} className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">{c}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {weeklyTableData.map((w,i)=>(
                        <tr key={i} className="border-t border-gray-50 hover:bg-purple-50/20 transition-colors">
                          <td className="py-3 px-4"><span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">S{w.num}</span></td>
                          <td className="py-3 px-4 text-sm font-medium text-gray-700 font-mono">{w.label}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{w.jours}/7</td>
                          <td className="py-3 px-4 text-sm font-bold text-blue-700 stat-num">{fmt(w.vol_phosphate)}</td>
                          <td className="py-3 px-4 text-sm text-amber-700 stat-num">{fmt(w.vol_sterile)}</td>
                          <td className="py-3 px-4 text-sm font-bold stat-num">{fmt(w.total_volume)}</td>
                          <td className="py-3 px-4 text-sm stat-num">{fmt(w.total_voyages)}</td>
                          <td className={`py-3 px-4 text-sm font-bold stat-num ${w.eff>=14?'text-green-600':w.eff>0?'text-red-500':'text-gray-400'}`}>{w.eff||'—'}</td>
                          <td className="py-3 px-4">
                            <button onClick={()=>exportRapportHebdoPDF({weeks:[w],month:activeMonth,daily:w.daily,monthLabel:`Semaine ${w.num} — ${monthLabel}`,cycleLabel:w.label})}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white hover:opacity-80"
                              style={{background:'linear-gradient(135deg,#7C3AED,#6D28D9)'}}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>PDF
                            </button>
                          </td>
                        </tr>
                      ))}
                      {weeklyTableData.length>0&&(()=>{
                        const tot=weeklyTableData.reduce((a,w)=>({vp:a.vp+w.vol_phosphate,vs:a.vs+w.vol_sterile,vt:a.vt+w.total_volume,vy:a.vy+w.total_voyages}),{vp:0,vs:0,vt:0,vy:0});
                        return (<tr style={{background:'#1A2332'}}>
                          <td colSpan={3} className="py-3 px-4 text-sm font-bold text-white">TOTAL MENSUEL</td>
                          <td className="py-3 px-4 text-sm font-bold text-blue-300 stat-num">{fmt(Math.round(tot.vp))}</td>
                          <td className="py-3 px-4 text-sm font-bold text-amber-300 stat-num">{fmt(Math.round(tot.vs))}</td>
                          <td className="py-3 px-4 text-sm font-bold text-white stat-num">{fmt(Math.round(tot.vt))}</td>
                          <td className="py-3 px-4 text-sm font-bold text-white stat-num">{fmt(tot.vy)}</td>
                          <td className="py-3 px-4 text-sm font-bold text-emerald-300 stat-num">{tot.vy>0?Math.round(tot.vt/tot.vy):'—'}</td>
                          <td/>
                        </tr>);
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              {weeks.length>0&&(
                <div className="bg-white rounded-2xl p-5 border border-gray-100/80" style={{boxShadow:'0 1px 8px rgba(0,0,0,0.05)'}}>
                  <h3 className="font-bold text-gray-800 mb-4">Production par Semaine</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <ComposedChart data={weeklyTableData} margin={{left:-10,right:10,top:5}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false}/>
                      <XAxis dataKey="label" tick={{fontSize:9,fill:'#94A3B8'}} axisLine={false} tickLine={false}/>
                      <YAxis tick={{fontSize:9,fill:'#94A3B8'}} axisLine={false} tickLine={false}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Bar dataKey="vol_phosphate" name="Phosphate m³" fill="#004B8D" radius={[3,3,0,0]} maxBarSize={50}/>
                      <Bar dataKey="vol_sterile" name="Stérile m³" fill="#F59E0B" radius={[3,3,0,0]} maxBarSize={50}/>
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* MENSUEL */}
          {reportType==='month'&&(
            <div className="space-y-4">
              <div className="flex justify-end">
                <button onClick={()=>{if(data)exportRapportMensuelPDF({data,month:activeMonth||`${viewYear}-${viewMonth}`});}}
                  disabled={!data||loading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40 hover:opacity-90"
                  style={{background:'linear-gradient(135deg,#004B8D,#0066CC)'}}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                  Exporter Rapport Mensuel PDF
                </button>
              </div>

              {chartWithCumul.length>0?(
                <div className="bg-white rounded-2xl p-5 border border-gray-100/80" style={{boxShadow:'0 1px 8px rgba(0,0,0,0.05)'}}>
                  <div className="flex items-center justify-between mb-5">
                    <div><h3 className="font-bold text-gray-800">Production Journalière — {monthLabel}</h3><p className="text-xs text-gray-400 mt-0.5">Volume m³ + courbe cumulative</p></div>
                    <div className="flex gap-3 text-xs">
                      <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{background:'#004B8D'}}/><span className="text-gray-500">Phosphate</span></div>
                      <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{background:'#F59E0B'}}/><span className="text-gray-500">Stérile</span></div>
                      <div className="flex items-center gap-1.5"><span className="w-3 h-0.5" style={{background:'#00843D'}}/><span className="text-gray-500">Cumul</span></div>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={chartWithCumul} margin={{left:-10,right:10,top:5}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false}/>
                      <XAxis dataKey="label" tick={{fontSize:9,fill:'#94A3B8'}} axisLine={false} tickLine={false} interval={2}/>
                      <YAxis yAxisId="vol" tick={{fontSize:9,fill:'#94A3B8'}} axisLine={false} tickLine={false}/>
                      <YAxis yAxisId="cumul" orientation="right" tick={{fontSize:9,fill:'#94A3B8'}} axisLine={false} tickLine={false}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Bar yAxisId="vol" dataKey="Phosphate m³" fill="#004B8D" radius={[3,3,0,0]} maxBarSize={20}/>
                      <Bar yAxisId="vol" dataKey="Stérile m³" fill="#F59E0B" radius={[3,3,0,0]} maxBarSize={20}/>
                      <Line yAxisId="cumul" type="monotone" dataKey="Cumul m³" stroke="#00843D" strokeWidth={2.5} dot={false} strokeDasharray="4 2"/>
                      <ReferenceLine yAxisId="vol" y={3000} stroke="#EF4444" strokeDasharray="4 2" strokeOpacity={0.4}/>
                    </ComposedChart>
                  </ResponsiveContainer>
                  <div className="text-xs text-red-400 mt-1 text-center">— seuil 3 000 m³/j phosphate</div>
                </div>
              ):(
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center text-amber-700">Aucune donnée pour <strong>{monthLabel}</strong>.</div>
              )}

              {chartData.length>0&&(
                <div className="bg-white rounded-2xl p-5 border border-gray-100/80" style={{boxShadow:'0 1px 8px rgba(0,0,0,0.05)'}}>
                  <h3 className="font-bold text-gray-800 mb-1">Efficacité m³/Voyage</h3>
                  <p className="text-xs text-gray-400 mb-4">Objectif ≥ 14 m³/voyage</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={chartData} margin={{left:-10,right:10,top:5}}>
                      <defs><linearGradient id="effGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7C3AED" stopOpacity={0.2}/><stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false}/>
                      <XAxis dataKey="label" tick={{fontSize:9,fill:'#94A3B8'}} axisLine={false} tickLine={false} interval={2}/>
                      <YAxis tick={{fontSize:9,fill:'#94A3B8'}} axisLine={false} tickLine={false}/>
                      <Tooltip formatter={v=>[v+' m³/vg','Efficacité']}/>
                      <ReferenceLine y={14} stroke="#00843D" strokeDasharray="4 2" strokeOpacity={0.6}/>
                      <Area type="monotone" dataKey="eff" name="m³/voyage" stroke="#7C3AED" fill="url(#effGrad)" strokeWidth={2.5} dot={false}/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {(data?.by_tranchee||[]).length>0&&(
                <div className="bg-white rounded-2xl border border-gray-100/80 overflow-hidden" style={{boxShadow:'0 1px 8px rgba(0,0,0,0.05)'}}>
                  <div className="px-5 py-4 border-b border-gray-100"><h3 className="font-bold text-gray-800">Performance par Tranchée — {activeMonth}</h3></div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr style={{background:'#F8FAFC'}}>
                        {['Tranchée','Type','Volume m³','Voyages','m³/voyage'].map(c=><th key={c} className="text-left py-2.5 px-4 text-xs font-bold text-gray-500 uppercase">{c}</th>)}
                      </tr></thead>
                      <tbody>
                        {data.by_tranchee.map((row,i)=>(
                          <tr key={i} className="border-t border-gray-50 hover:bg-gray-50">
                            <td className="py-2.5 px-4 text-sm font-bold text-gray-800">{row.tranchee||'—'}</td>
                            <td className="py-2.5 px-4"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${row.type_materiau==='PHOSPHATE'?'bg-blue-100 text-blue-700':'bg-amber-100 text-amber-700'}`}>{row.type_materiau}</span></td>
                            <td className="py-2.5 px-4 text-sm font-bold stat-num" style={{color:'#004B8D'}}>{fmt(row.total_volume)}</td>
                            <td className="py-2.5 px-4 text-sm stat-num">{fmt(row.total_voyages)}</td>
                            <td className="py-2.5 px-4 text-sm font-bold stat-num" style={{color:'#00843D'}}>{row.total_voyages>0?Math.round(row.total_volume/row.total_voyages):'—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {daily.length>0&&(
                <div className="bg-white rounded-2xl border border-gray-100/80 overflow-hidden" style={{boxShadow:'0 1px 8px rgba(0,0,0,0.05)'}}>
                  <div className="px-5 py-4 border-b border-gray-100"><h3 className="font-bold text-gray-800">Tableau Journalier Complet</h3></div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr style={{background:'#0D2B4E'}}>
                        {['Date','Phosphate m³','Stérile m³','Total m³','Voyages','m³/vg'].map(c=>(
                          <th key={c} className="text-left py-2.5 px-4 text-xs font-semibold text-gray-300 uppercase">{c}</th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {daily.map((row,i)=>{
                          const low=parseFloat(row.volume_phosphate)<3000&&parseFloat(row.volume_phosphate)>0;
                          const eff=row.total_voyages>0?Math.round(row.total_volume/row.total_voyages):0;
                          return (
                            <tr key={i} className={`border-t border-gray-50 hover:bg-blue-50/20 ${low?'bg-red-50/40':i%2===0?'':'bg-gray-50/40'}`}>
                              <td className="py-2.5 px-4 text-sm font-medium text-gray-700">{row.date}{low&&<span className="text-xs text-red-400 ml-1">⚠</span>}</td>
                              <td className="py-2.5 px-4 text-sm font-bold stat-num" style={{color:'#004B8D'}}>{fmt(row.volume_phosphate)}</td>
                              <td className="py-2.5 px-4 text-sm stat-num" style={{color:'#B45309'}}>{fmt(row.volume_sterile)}</td>
                              <td className="py-2.5 px-4 text-sm font-bold stat-num">{fmt(row.total_volume)}</td>
                              <td className="py-2.5 px-4 text-sm stat-num">{fmt(row.total_voyages)}</td>
                              <td className={`py-2.5 px-4 text-sm font-bold stat-num ${eff>=14?'text-green-600':eff>0?'text-red-500':'text-gray-400'}`}>{eff||'—'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
