import { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const fmt = n => n ? Number(n).toLocaleString('fr-FR') : '0';
const COLORS = ['#004B8D','#00843D','#F59E0B','#8B5CF6','#EC4899','#06B6D4'];

const CardIcons = {
  phosphate: (
    <svg viewBox="0 0 40 40" className="w-10 h-10">
      <circle cx="20" cy="20" r="20" fill="#EFF6FF"/>
      <path d="M12 28l8-16 8 16" stroke="#004B8D" strokeWidth="2" fill="none" strokeLinejoin="round"/>
      <line x1="14" y1="23" x2="26" y2="23" stroke="#004B8D" strokeWidth="2"/>
    </svg>
  ),
  sterile: (
    <svg viewBox="0 0 40 40" className="w-10 h-10">
      <circle cx="20" cy="20" r="20" fill="#FFFBEB"/>
      <rect x="10" y="22" width="20" height="6" rx="1" fill="#F59E0B" fillOpacity="0.3" stroke="#F59E0B" strokeWidth="1.5"/>
      <rect x="13" y="17" width="14" height="6" rx="1" fill="#F59E0B" fillOpacity="0.3" stroke="#F59E0B" strokeWidth="1.5"/>
      <rect x="16" y="12" width="8" height="6" rx="1" fill="#F59E0B" fillOpacity="0.3" stroke="#F59E0B" strokeWidth="1.5"/>
    </svg>
  ),
  voyages: (
    <svg viewBox="0 0 40 40" className="w-10 h-10">
      <circle cx="20" cy="20" r="20" fill="#F0FDF4"/>
      <path d="M8 22h2l2-6h12l2 4h2" stroke="#00843D" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <circle cx="13" cy="26" r="2" stroke="#00843D" strokeWidth="1.8" fill="none"/>
      <circle cx="23" cy="26" r="2" stroke="#00843D" strokeWidth="1.8" fill="none"/>
    </svg>
  ),
  engins: (
    <svg viewBox="0 0 40 40" className="w-10 h-10">
      <circle cx="20" cy="20" r="20" fill="#F5F3FF"/>
      <path d="M12 26V18l4-4h8l4 8v4H12z" stroke="#7C3AED" strokeWidth="1.8" fill="none" strokeLinejoin="round"/>
      <line x1="12" y1="22" x2="28" y2="22" stroke="#7C3AED" strokeWidth="1.5"/>
      <line x1="18" y1="14" x2="18" y2="22" stroke="#7C3AED" strokeWidth="1.5"/>
    </svg>
  ),
};

function StatCard({ title, value, subtitle, icon, colorClass, delay='' }) {
  return (
    <div className={`bg-white rounded-2xl p-5 border border-gray-100/80 card-hover fade-up ${delay}`}
      style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
      <div className="flex items-start justify-between mb-3">
        {icon}
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${colorClass}`}>Mois</span>
      </div>
      <div className="stat-num text-2xl font-bold text-gray-900 tracking-tight">{value}</div>
      <div className="text-sm font-medium text-gray-600 mt-0.5">{title}</div>
      {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.color }}/>
          <span className="text-gray-600">{p.name}:</span>
          <span className="font-semibold">{Number(p.value).toLocaleString('fr-FR')} m³</span>
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    dashboardAPI.get()
      .then(r => { setData(r.data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"/>
        <span className="text-sm text-gray-400">Chargement des données...</span>
      </div>
    </div>
  );
  if (error || !data) return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
      <div className="text-red-600 font-semibold mb-1">Impossible de charger les données</div>
      <div className="text-red-400 text-sm">{error || 'Vérifiez que le backend Laravel tourne sur le port 8000'}</div>
    </div>
  );

  // ✅ Clés exactes retournées par DashboardController::index()
  const kpis = data.kpis || {};
  const trend = (data.trend_15j || []).map(d => ({
    date: d.date,
    vol_phosphate: d.volume_phosphate || 0,
    vol_sterile: d.volume_sterile || 0,
  }));
  const topDest = data.top_destinations || [];
  const byTranchee = data.by_tranchee || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="fade-up">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Indicateurs du mois</h2>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Volume Phosphate" value={fmt(kpis.volume_phosphate_mois) + ' m³'} subtitle={`${kpis.jours_production || 0} jours travaillés`} icon={CardIcons.phosphate} colorClass="bg-blue-50 text-blue-600" delay="fade-up-1"/>
        <StatCard title="Volume Stérile" value={fmt(kpis.volume_sterile_mois) + ' m³'} subtitle="Ce mois" icon={CardIcons.sterile} colorClass="bg-amber-50 text-amber-600" delay="fade-up-2"/>
        <StatCard title="Total Voyages" value={fmt(kpis.total_voyages_mois)} subtitle={`${kpis.jours_production || 0} jours`} icon={CardIcons.voyages} colorClass="bg-green-50 text-green-600" delay="fade-up-3"/>
        <StatCard title="Flotte Active" value={`${kpis.nb_camions_actifs || 0} camions`} subtitle={`Dispo: ${kpis.taux_disponibilite || 100}%`} icon={CardIcons.engins} colorClass="bg-violet-50 text-violet-600" delay="fade-up-4"/>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 bg-white rounded-2xl p-5 border border-gray-100/80 fade-up" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-gray-800">Tendance Production</h3>
              <p className="text-xs text-gray-400 mt-0.5">15 derniers jours — Volume m³</p>
            </div>
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-blue-600 inline-block rounded"/><span className="text-gray-500">Phosphate</span></div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-amber-500 inline-block rounded"/><span className="text-gray-500">Stérile</span></div>
            </div>
          </div>
          {trend.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              Aucune donnée sur les 15 derniers jours.<br/>Les données seront affichées dès qu'il y a des productions récentes.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <LineChart data={trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false}/>
                <XAxis dataKey="date" tickFormatter={d => d?.slice(5)} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Line type="monotone" dataKey="vol_phosphate" name="Phosphate" stroke="#004B8D" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }}/>
                <Line type="monotone" dataKey="vol_sterile" name="Stérile" stroke="#F59E0B" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }}/>
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Destinations */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100/80 fade-up" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
          <h3 className="font-semibold text-gray-800 mb-1">Top Destinations</h3>
          <p className="text-xs text-gray-400 mb-4">Volume total m³</p>
          {topDest.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">Aucune destination ce mois</div>
          ) : (
            <div className="space-y-3">
              {topDest.slice(0, 6).map((d, i) => {
                const max = topDest[0]?.total_volume || topDest[0]?.vol_total || 1;
                const val = d.total_volume || d.vol_total || 0;
                const pct = Math.round((val / max) * 100);
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-gray-700 truncate max-w-32">{d.destination}</span>
                      <span className="text-gray-500 font-mono ml-2">{Number(val).toLocaleString('fr-FR')}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: pct + '%', background: COLORS[i % COLORS.length] }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Tranchée table */}
        <div className="bg-white rounded-2xl border border-gray-100/80 overflow-hidden fade-up" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Performance par Tranchée</h3>
            <p className="text-xs text-gray-400 mt-0.5">Volume mensuel</p>
          </div>
          <div className="overflow-auto max-h-64">
            {byTranchee.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">Aucune donnée</div>
            ) : (
              <table className="w-full">
                <thead><tr style={{ background: '#F8FAFC' }}>
                  {['Tranchée','Type','Volume m³','m³/vg'].map(h => <th key={h} className="text-left py-2.5 px-4 text-xs font-bold text-gray-500 uppercase">{h}</th>)}
                </tr></thead>
                <tbody>
                  {byTranchee.map((row, i) => (
                    <tr key={i} className="border-t border-gray-50 table-row-hover">
                      <td className="py-2.5 px-4 text-sm font-semibold text-gray-800">{row.tranchee || '—'}</td>
                      <td className="py-2.5 px-4">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${(row.type_materiau || '') === 'PHOSPHATE' ? 'badge-phosphate' : 'badge-sterile'}`}>
                          {row.type_materiau || 'MIXTE'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-sm font-bold text-blue-700 stat-num">{Number(row.total_volume || row.vol_total || 0).toLocaleString('fr-FR')}</td>
                      <td className="py-2.5 px-4 text-sm font-semibold text-emerald-600 stat-num">
                        {(row.total_voyages || row.total_voyage) > 0
                          ? Math.round((row.total_volume || row.vol_total || 0) / (row.total_voyages || row.total_voyage))
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Résumé aujourd'hui */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100/80 fade-up" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
          <h3 className="font-semibold text-gray-800 mb-4">Résumé Aujourd'hui</h3>
          {kpis.volume_today > 0 ? (
            <div className="space-y-3">
              {[
                { label: 'Volume total', val: fmt(kpis.volume_today) + ' m³', bg: '#EFF6FF', color: '#004B8D' },
                { label: 'Total voyages', val: fmt(kpis.voyages_today), bg: '#F0FDF4', color: '#00843D' },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: s.bg }}>
                  <span className="text-sm font-medium" style={{ color: s.color }}>{s.label}</span>
                  <span className="font-bold stat-num" style={{ color: s.color }}>{s.val}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <svg viewBox="0 0 48 48" className="w-10 h-10 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="6" y="6" width="36" height="36" rx="4"/><line x1="6" y1="18" x2="42" y2="18"/><line x1="18" y1="6" x2="18" y2="42"/>
              </svg>
              <div className="text-sm">Aucune production saisie aujourd'hui</div>
              <div className="text-xs mt-1 text-gray-300">Les données des mois précédents sont disponibles dans Rapports</div>
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Phosphate mois', val: fmt(kpis.volume_phosphate_mois) + ' m³', color: '#004B8D' },
                { label: 'Voyages mois', val: fmt(kpis.total_voyages_mois), color: '#00843D' },
              ].map((s, i) => (
                <div key={i} className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-400 mb-1">{s.label}</div>
                  <div className="text-sm font-bold stat-num" style={{ color: s.color }}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
