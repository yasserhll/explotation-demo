import { useState, useEffect } from 'react';
import { productionAPI, weeklyAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function Rapports() {
  const [monthlyData, setMonthlyData] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    setLoading(true);
    Promise.all([
      productionAPI.getMonthly(month),
      weeklyAPI.getAll({ from: month + '-01', to: month + '-31' })
    ]).then(([m, w]) => {
      setMonthlyData(m.data);
      setWeeklyData(w.data.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [month]);

  const fmt = n => Number(n || 0).toLocaleString('fr-FR');
  const t = monthlyData?.totals;

  const chartData = (monthlyData?.by_day || []).map(d => ({
    ...d,
    date: d.date?.slice(5),
    vol_phosphate: parseInt(d.vol_phosphate) || 0,
    vol_sterile: parseInt(d.vol_sterile) || 0,
  }));

  const exportCSV = () => {
    if (!monthlyData?.by_day) return;
    const rows = [['Date', 'Phosphate m³', 'Stérile m³', 'Total m³', 'Voyages']];
    monthlyData.by_day.forEach(r => {
      rows.push([r.date, r.vol_phosphate, r.vol_sterile, r.vol_total, r.total_voyages]);
    });
    const csv = rows.map(r => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport_benguerir_${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Mois</label>
          <input type="month" value={month} onChange={e => setMonth(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
        </div>
        <div className="ml-auto">
          <button onClick={exportCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
            ⬇ Exporter CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Chargement...</div>
      ) : (
        <>
          {/* Monthly Totals */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="text-xs text-blue-600">Phosphate Total</div>
              <div className="text-xl font-bold text-blue-800 mt-1">{fmt(t?.vol_phosphate)} m³</div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
              <div className="text-xs text-yellow-600">Stérile Total</div>
              <div className="text-xl font-bold text-yellow-800 mt-1">{fmt(t?.vol_sterile)} m³</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <div className="text-xs text-green-600">Volume Total</div>
              <div className="text-xl font-bold text-green-800 mt-1">{fmt(t?.vol_total)} m³</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
              <div className="text-xs text-purple-600">Total Voyages</div>
              <div className="text-xl font-bold text-purple-800 mt-1">{fmt(t?.total_voyages)}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="text-xs text-gray-500">Jours Travaillés</div>
              <div className="text-xl font-bold text-gray-800 mt-1">{t?.jours_travailles || 0}</div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-700 mb-4">Production Quotidienne — {month}</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v, n) => [Number(v).toLocaleString('fr-FR') + ' m³', n]} />
                <Legend />
                <Bar dataKey="vol_phosphate" name="Phosphate" fill="#004B8D" radius={[2, 2, 0, 0]} />
                <Bar dataKey="vol_sterile" name="Stérile" fill="#F5821E" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* By tranchee */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-700">Production par Tranchée/Panneau</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">Tranchée</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">Panneau</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">Matériau</th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium">Volume m³</th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium">Voyages</th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium">m³/voyage</th>
                  </tr>
                </thead>
                <tbody>
                  {(monthlyData?.by_tranchee || []).map((row, i) => (
                    <tr key={i} className="border-t border-gray-50 hover:bg-gray-50">
                      <td className="py-2.5 px-4 font-medium">{row.tranchee}</td>
                      <td className="py-2.5 px-4 text-gray-500">{row.panneau}</td>
                      <td className="py-2.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                          ${row.type_materiau === 'PHOSPHATE' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {row.type_materiau}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold font-mono text-blue-700">{fmt(row.vol_total)}</td>
                      <td className="py-2.5 px-4 text-right font-mono">{fmt(row.total_voyages)}</td>
                      <td className="py-2.5 px-4 text-right text-green-600 font-mono">
                        {row.total_voyages > 0 ? Math.round(row.vol_total / row.total_voyages) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Daily table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-700">Rapport Journalier Détaillé</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">Date</th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium">Phosphate m³</th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium">Stérile m³</th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium">Total m³</th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium">Voyages</th>
                  </tr>
                </thead>
                <tbody>
                  {(monthlyData?.by_day || []).map((row, i) => (
                    <tr key={i} className={`border-t border-gray-50 hover:bg-gray-50 ${parseInt(row.vol_total) < 3000 ? 'bg-red-50/50' : ''}`}>
                      <td className="py-2.5 px-4 font-medium">
                        {new Date(row.date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit' })}
                        {parseInt(row.vol_total) < 3000 && <span className="ml-2 text-xs text-red-500">⚠️</span>}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-blue-700">{fmt(row.vol_phosphate)}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-yellow-700">{fmt(row.vol_sterile)}</td>
                      <td className="py-2.5 px-4 text-right font-bold font-mono">{fmt(row.vol_total)}</td>
                      <td className="py-2.5 px-4 text-right font-mono">{fmt(row.total_voyages)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
