import { useState, useEffect } from 'react';
import { affectationAPI } from '../services/api';

export default function Affectations() {
  const [affectations, setAffectations] = useState([]);
  const [engins, setEngins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [editRow, setEditRow] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      affectationAPI.getAll(date),
      affectationAPI.getEngins()
    ]).then(([a, e]) => {
      setAffectations(a.data.data || []);
      setEngins(e.data.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [date]);

  const handleSaveRow = async (row) => {
    setSaving(true);
    try {
      if (row.id) {
        await affectationAPI.update(row.id, row);
      } else {
        await affectationAPI.create({ ...row, date });
      }
      setEditRow(null);
      setMsg({ type: 'success', text: 'Affectation sauvegardée ✓' });
      load();
    } catch (err) {
      setMsg({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    }
    setSaving(false);
    setTimeout(() => setMsg(null), 3000);
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ?')) return;
    await affectationAPI.delete(id);
    load();
  };

  const handleEnginStatus = async (engin, status) => {
    await affectationAPI.updateEngin(engin.id, { statut: status });
    load();
  };

  const addNewRow = () => {
    setEditRow({ id: null, conducteur_1: '', numero_camion: '', conducteur_2: '', statut: 'actif' });
  };

  return (
    <div className="space-y-6">
      {msg && (
        <div className={`p-3 rounded-lg text-sm font-medium ${msg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {msg.text}
        </div>
      )}

      {/* Date selector */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Date d'affectation</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
          </div>
          <div className="text-sm text-gray-500">{affectations.length} camions affectés</div>
        </div>
        <button onClick={addNewRow}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          + Ajouter
        </button>
      </div>

      {/* Edit modal */}
      {editRow !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-800">{editRow.id ? 'Modifier' : 'Nouvelle Affectation'}</h2>
              <button onClick={() => setEditRow(null)} className="text-gray-400">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">N° Camion</label>
                <input value={editRow.numero_camion} onChange={e => setEditRow({ ...editRow, numero_camion: e.target.value })}
                  placeholder="Ex: D183"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Conducteur 1ère équipe</label>
                <input value={editRow.conducteur_1} onChange={e => setEditRow({ ...editRow, conducteur_1: e.target.value })}
                  placeholder="Nom conducteur"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Conducteur 2ème équipe</label>
                <input value={editRow.conducteur_2} onChange={e => setEditRow({ ...editRow, conducteur_2: e.target.value })}
                  placeholder="Nom conducteur"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Statut</label>
                <select value={editRow.statut} onChange={e => setEditRow({ ...editRow, statut: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                  <option value="actif">Actif</option>
                  <option value="en_panne">En panne</option>
                  <option value="arret">Arrêt</option>
                </select>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={() => setEditRow(null)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg">Annuler</button>
              <button onClick={() => handleSaveRow(editRow)} disabled={saving}
                className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {saving ? '...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Camions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-700">🚛 Affectation Camions</h3>
          </div>
          <div className="overflow-auto max-h-96">
            {loading ? (
              <div className="text-center py-8 text-gray-400">Chargement...</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-2 px-4 text-gray-500 font-medium">Camion</th>
                    <th className="text-left py-2 px-4 text-gray-500 font-medium">Conducteur 1</th>
                    <th className="text-left py-2 px-4 text-gray-500 font-medium">Conducteur 2</th>
                    <th className="text-left py-2 px-4 text-gray-500 font-medium">Statut</th>
                    <th className="py-2 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {affectations.map(aff => (
                    <tr key={aff.id} className="border-t border-gray-50 hover:bg-gray-50">
                      <td className="py-2.5 px-4 font-bold text-blue-700">{aff.numero_camion}</td>
                      <td className="py-2.5 px-4 text-gray-700">{aff.conducteur_1 || '-'}</td>
                      <td className="py-2.5 px-4 text-gray-500 text-xs">{aff.conducteur_2 || '-'}</td>
                      <td className="py-2.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                          ${aff.statut === 'actif' ? 'bg-green-100 text-green-700' 
                          : aff.statut === 'en_panne' ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-600'}`}>
                          {aff.statut}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex gap-2">
                          <button onClick={() => setEditRow(aff)} className="text-blue-400 hover:text-blue-600 text-xs">✏️</button>
                          <button onClick={() => handleDelete(aff.id)} className="text-red-400 hover:text-red-600 text-xs">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {affectations.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-6 text-gray-400">Aucune affectation pour cette date</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Engins */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-700">🏗️ Engins de Chantier</h3>
          </div>
          <div className="p-4 space-y-3">
            {engins.map(engin => (
              <div key={engin.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-bold text-gray-800">{engin.code}</div>
                  <div className="text-xs text-gray-500">{engin.conducteur_1}{engin.conducteur_2 ? ' / ' + engin.conducteur_2 : ''}</div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={engin.statut}
                    onChange={e => handleEnginStatus(engin, e.target.value)}
                    className={`text-xs border rounded-full px-2 py-1 font-medium
                      ${engin.statut === 'disponible' ? 'bg-green-100 border-green-200 text-green-700'
                      : engin.statut === 'en_panne' ? 'bg-red-100 border-red-200 text-red-700'
                      : 'bg-gray-100 border-gray-200 text-gray-600'}`}
                  >
                    <option value="disponible">✓ Disponible</option>
                    <option value="en_panne">✗ En panne</option>
                    <option value="maintenance">🔧 Maintenance</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
