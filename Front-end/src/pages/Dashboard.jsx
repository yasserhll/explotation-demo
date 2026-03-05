import { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#004B8D', '#00843D', '#F5821E', '#8B5CF6', '#EC4899'];

function StatCard({ title, value, subtitle, color, icon }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500 font-medium">{title}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-2xl font-bold" style={{ color }}>{value}</div>
      {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.get().then(r => {
      setData(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Chargement...</div>;
  if (!data) return <div className="text-red-500 p-4">Erreur de chargement. Vérifiez que le backend PHP tourne sur le port 8000.</div>;

  const { month_stats, today_stats, weekly_trend, top_destinations, nb_camions, nb_engins, nb_engins_disponibles, perf_tranchee } = data;

  const fmt = n => n ? Number(n).toLocaleString('fr-FR') : '0';

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Volume Phosphate (mois)" value={fmt(month_stats?.vol_phosphate) + ' m³'} subtitle="Ce mois" color="#004B8D" icon="⛏️" />
        <StatCard title="Volume Stérile (mois)" value={fmt(month_stats?.vol_sterile) + ' m³'} subtitle="Ce mois" color="#F5821E" icon="🪨" />
        <StatCard title="Total Voyages (mois)" value={fmt(month_stats?.total_voyages)} subtitle={`${month_stats?.jours_travailles || 0} jours travaillés`} color="#00843D" icon="🚛" />
        <StatCard title="Camions Affectés" value={nb_camions} subtitle={`${nb_engins_disponibles}/${nb_engins} engins dispo`} color="#8B5CF6" icon="🏗️" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend chart */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-4">Évolution Production (15 derniers jours)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weekly_trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tickFormatter={d => d?.slice(5)} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [Number(v).toLocaleString('fr-FR') + ' m³', '']} labelFormatter={d => 'Date: ' + d} />
              <Legend />
              <Line type="monotone" dataKey="vol_phosphate" name="Phosphate" stroke="#004B8D" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="vol_sterile" name="Stérile" stroke="#F5821E" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Destinations */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-4">Top Destinations (Volume)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={top_destinations} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="destination" tick={{ fontSize: 10 }} width={130} />
              <Tooltip formatter={(v) => [Number(v).toLocaleString('fr-FR') + ' m³']} />
              <Bar dataKey="vol_total" name="Volume m³" fill="#00843D" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance par Tranchée */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-4">Performance par Tranchée</h3>
          <div className="overflow-auto max-h-64">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-2 px-3 text-gray-600 font-medium">Tranchée</th>
                  <th className="text-left py-2 px-3 text-gray-600 font-medium">Panneau</th>
                  <th className="text-left py-2 px-3 text-gray-600 font-medium">Type</th>
                  <th className="text-right py-2 px-3 text-gray-600 font-medium">Volume m³</th>
                  <th className="text-right py-2 px-3 text-gray-600 font-medium">m³/vgs</th>
                </tr>
              </thead>
              <tbody>
                {(perf_tranchee || []).map((row, i) => (
                  <tr key={i} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="py-2 px-3 font-medium">{row.tranchee}</td>
                    <td className="py-2 px-3 text-gray-500">{row.panneau}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${row.type_materiau === 'PHOSPHATE' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {row.type_materiau}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-mono">{Number(row.vol_total).toLocaleString('fr-FR')}</td>
                    <td className="py-2 px-3 text-right text-green-600 font-mono">{row.vol_moyen_par_voyage || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Today's summary */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-4">Résumé Aujourd'hui</h3>
          {today_stats?.vol_total > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-blue-700">Phosphate extrait</span>
                <span className="font-bold text-blue-800">{fmt(today_stats?.vol_phosphate)} m³</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <span className="text-sm text-orange-700">Stérile évacué</span>
                <span className="font-bold text-orange-800">{fmt(today_stats?.vol_sterile)} m³</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-green-700">Total voyages</span>
                <span className="font-bold text-green-800">{fmt(today_stats?.total_voyages)}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2">📝</div>
              <div>Aucune production saisie aujourd'hui</div>
              <button onClick={() => {}} className="mt-3 text-blue-600 text-sm hover:underline">
                → Saisir la production
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
