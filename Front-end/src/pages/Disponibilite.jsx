import { useState, useEffect } from 'react';
import { arretAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const TYPES_ARRET = ['Panne mécanique', 'Panne électrique', 'Météo (pluie)', 'Manque carburant', 'Entretien préventif', 'Arrêt direction', 'Attente engin', 'Autre'];
const COLORS_ARRET = ['#EF4444', '#F97316', '#EAB308', '#8B5CF6', '#06B6D4', '#10B981', '#6366F1', '#84CC16'];

export default function Disponibilite() {
  const [disponibilite, setDisponibilite] = useState(null);
  const [arrets, setArrets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), type_arret: '', description: '', duree_heures: '', engin_code: '' });
  const [period, setPeriod] = useState({ from: new Date().toISOString().slice(0, 8) + '01', to: new Date().toISOString().slice(0, 10) });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      arretAPI.getDisponibilite(period),
      arretAPI.getAll(period)
    ]).then(([d, a]) => {
      setDisponibilite(d.data);
      setArrets(a.data.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [period.from, period.to]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await arretAPI.create(form);
      setShowForm(false);
      setForm({ date: new Date().toISOString().slice(0, 10), type_arret: '', description: '', duree_heures: '', engin_code: '' });
      load();
    } catch (err) {}
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet arrêt ?')) return;
    await arretAPI.delete(id);
    load();
  };

  const taux = disponibilite?.taux_disponibilite || 0;
  const tauxColor = taux >= 85 ? '#00843D' : taux >= 70 ? '#F5821E' : '#EF4444';

  const pieData = (disponibilite?.arrets_par_type || []).map((a, i) => ({
    name: a.type_arret,
    value: parseFloat(a.total_heures),
    color: COLORS_ARRET[i % COLORS_ARRET.length]
  }));

  return (
    <div className="space-y-6">
      {/* Period + Add button */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Du</label>
          <input type="date" value={period.from} onChange={e => setPeriod(p => ({ ...p, from: e.target.value }))}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Au</label>
          <input type="date" value={period.to} onChange={e => setPeriod(p => ({ ...p, to: e.target.value }))}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
        </div>
        <button onClick={() => setShowForm(true)}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600">
          + Enregistrer un Arrêt
        </button>
      </div>

      {/* KPIs */}
      {disponibilite && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Taux Gauge */}
          <div className="col-span-2 lg:col-span-1 bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-center">
            <div className="text-xs text-gray-500 mb-2">Taux de Disponibilité</div>
            <div className="text-5xl font-black" style={{ color: tauxColor }}>{taux}%</div>
            <div className="mt-2 text-xs text-gray-400">{taux >= 85 ? '✅ Bon' : taux >= 70 ? '⚠️ À améliorer' : '🔴 Critique'}</div>
            <div className="mt-3 bg-gray-100 rounded-full h-2">
              <div className="h-2 rounded-full transition-all" style={{ width: taux + '%', background: tauxColor }}></div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="text-xs text-gray-500 mb-1">Heures disponibles</div>
            <div className="text-2xl font-bold text-green-600">{disponibilite.heures_disponibles}h</div>
            <div className="text-xs text-gray-400">sur {disponibilite.heures_possibles}h possibles</div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="text-xs text-gray-500 mb-1">Total heures d'arrêt</div>
            <div className="text-2xl font-bold text-red-600">{disponibilite.heures_arret_total}h</div>
            <div className="text-xs text-gray-400">{arrets.length} arrêt(s) enregistré(s)</div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="text-xs text-gray-500 mb-1">Jours travaillés</div>
            <div className="text-2xl font-bold text-blue-600">{disponibilite.jours_travailles}</div>
            <div className="text-xs text-gray-400">{disponibilite.heures_theoriques_par_jour}h théoriques/jour</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Arrets by type */}
        {pieData.length > 0 && (
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-700 mb-4">Répartition Arrêts par Type</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={v => [v + 'h', 'Durée']} />
                <Legend formatter={v => <span className="text-xs">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Arret form */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-gray-800">Enregistrer un Arrêt</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400">✕</button>
              </div>
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Date *</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Type d'Arrêt *</label>
                  <select value={form.type_arret} onChange={e => setForm({ ...form, type_arret: e.target.value })} required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300">
                    <option value="">Sélectionner...</option>
                    {TYPES_ARRET.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Durée (heures) *</label>
                  <input type="number" step="0.5" min="0.5" value={form.duree_heures}
                    onChange={e => setForm({ ...form, duree_heures: e.target.value })} required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    placeholder="Ex: 2.5" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Engin concerné</label>
                  <input value={form.engin_code} onChange={e => setForm({ ...form, engin_code: e.target.value })}
                    placeholder="Ex: 350-E71"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Description</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={2} placeholder="Détails de l'arrêt..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none" />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg">Annuler</button>
                  <button type="submit" disabled={saving}
                    className="px-5 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50">
                    {saving ? '...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Arrets list */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-700">Historique des Arrêts</h3>
            <button onClick={() => setShowForm(true)} className="text-orange-500 text-sm hover:text-orange-700">+ Ajouter</button>
          </div>
          <div className="overflow-auto max-h-72">
            {loading ? (
              <div className="text-center py-8 text-gray-400">Chargement...</div>
            ) : arrets.length === 0 ? (
              <div className="text-center py-8 text-gray-400">Aucun arrêt enregistré</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-2 px-4 text-gray-500 text-xs">Date</th>
                    <th className="text-left py-2 px-4 text-gray-500 text-xs">Type</th>
                    <th className="text-right py-2 px-4 text-gray-500 text-xs">Durée</th>
                    <th className="text-left py-2 px-4 text-gray-500 text-xs">Engin</th>
                    <th className="py-2 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {arrets.map(a => (
                    <tr key={a.id} className="border-t border-gray-50 hover:bg-gray-50">
                      <td className="py-2 px-4 text-gray-600">{a.date}</td>
                      <td className="py-2 px-4 font-medium">{a.type_arret}</td>
                      <td className="py-2 px-4 text-right font-bold text-red-600">{a.duree_heures}h</td>
                      <td className="py-2 px-4 text-gray-500 text-xs">{a.engin_code || '-'}</td>
                      <td className="py-2 px-4">
                        <button onClick={() => handleDelete(a.id)} className="text-red-400 hover:text-red-600 text-xs">🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
