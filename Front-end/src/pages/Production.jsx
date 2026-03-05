import { useState, useEffect } from 'react';
import { productionAPI } from '../services/api';

const EMPTY_FORM = {
  date: new Date().toISOString().slice(0, 10),
  type_materiau: 'PHOSPHATE',
  niveau: '',
  tranchee: '',
  panneau: '',
  destination: '',
  distance_km: '',
  nbr_voyage_1er: '',
  nbr_voyage_2e: '',
  total_voyage: '',
  volume_m3: '',
  camion_1er: '',
  camion_2e: '',
  pelle_1er: '',
  pelle_2e: '',
};

const DESTINATIONS = ['CRIBLAGE MOBILE', 'STOCK PSF', 'STOCK PSF SAFI', 'STOCK GOUDRON', 'STOCK BASCULE', 'STOCK STOTE N2', 'DECHARGE', 'TREMIE 1', 'TREMIE 2', 'TREMIE MOBILE', 'STOCK ZAGORA', 'STOCK PONT BASCULE'];
const PELLES = ['350-E71', '350-E64', '480-E49', '336-E18', 'CH-E48', '966H E48'];
const TRANCHEES = ['TG4', 'TJ9', 'TF8', 'TE9', 'TE10', 'TH15', 'T43', 'TG3'];
const PANNEAUX = ['P4', 'P5', 'P6', 'P7'];

export default function Production() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 10));
  const [filterType, setFilterType] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = () => {
    setLoading(true);
    productionAPI.getAll({ date: filterDate, type: filterType || undefined }).then(r => {
      setRecords(r.data.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterDate, filterType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updated = { ...form, [name]: value };
    // Auto-calculate total voyage and volume
    if (name === 'nbr_voyage_1er' || name === 'nbr_voyage_2e') {
      const v1 = parseInt(name === 'nbr_voyage_1er' ? value : form.nbr_voyage_1er) || 0;
      const v2 = parseInt(name === 'nbr_voyage_2e' ? value : form.nbr_voyage_2e) || 0;
      updated.total_voyage = v1 + v2;
      if (form.distance_km) {
        updated.volume_m3 = Math.round((v1 + v2) * 16);
      }
    }
    if (name === 'total_voyage' && !form.volume_m3) {
      updated.volume_m3 = Math.round(parseInt(value) * 16);
    }
    setForm(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await productionAPI.update(editId, form);
        setMsg({ type: 'success', text: 'Ligne mise à jour ✓' });
      } else {
        await productionAPI.create(form);
        setMsg({ type: 'success', text: 'Production enregistrée ✓' });
      }
      setShowForm(false);
      setEditId(null);
      setForm({ ...EMPTY_FORM, date: filterDate });
      load();
    } catch (err) {
      setMsg({ type: 'error', text: 'Erreur: ' + (err.response?.data?.error || err.message) });
    }
    setSaving(false);
    setTimeout(() => setMsg(null), 3000);
  };

  const handleEdit = (rec) => {
    setForm({ ...rec });
    setEditId(rec.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette ligne ?')) return;
    await productionAPI.delete(id);
    load();
  };

  const totals = records.reduce((acc, r) => ({
    voyages: acc.voyages + (parseInt(r.total_voyage) || 0),
    volume: acc.volume + (parseInt(r.volume_m3) || 0),
  }), { voyages: 0, volume: 0 });

  const fmt = n => Number(n || 0).toLocaleString('fr-FR');

  return (
    <div className="space-y-4">
      {msg && (
        <div className={`p-3 rounded-lg text-sm font-medium ${msg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {msg.text}
        </div>
      )}

      {/* Filters + Actions */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-3 items-center">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Date</label>
          <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Type</label>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="">Tous</option>
            <option value="PHOSPHATE">Phosphate</option>
            <option value="STERILE">Stérile</option>
          </select>
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={() => { setForm({ ...EMPTY_FORM, date: filterDate }); setEditId(null); setShowForm(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            + Ajouter une ligne
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <div className="text-xs text-blue-600 mb-1">Total Voyages</div>
          <div className="text-xl font-bold text-blue-800">{fmt(totals.voyages)}</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <div className="text-xs text-green-600 mb-1">Total Volume</div>
          <div className="text-xl font-bold text-green-800">{fmt(totals.volume)} m³</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Nb Lignes</div>
          <div className="text-xl font-bold text-gray-700">{records.length}</div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-screen overflow-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">{editId ? 'Modifier' : 'Nouvelle Ligne de Production'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Date *</label>
                  <input type="date" name="date" value={form.date} onChange={handleChange} required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Type Matériau *</label>
                  <select name="type_materiau" value={form.type_materiau} onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                    <option value="PHOSPHATE">PHOSPHATE</option>
                    <option value="STERILE">STÉRILE</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Tranchée</label>
                  <input list="tranchees" name="tranchee" value={form.tranchee} onChange={handleChange} placeholder="Ex: TG4"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                  <datalist id="tranchees">{TRANCHEES.map(t => <option key={t} value={t} />)}</datalist>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Panneau</label>
                  <select name="panneau" value={form.panneau} onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                    <option value="">--</option>
                    {PANNEAUX.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Niveau</label>
                  <input name="niveau" value={form.niveau} onChange={handleChange} placeholder="Ex: C4"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Destination *</label>
                  <input list="dests" name="destination" value={form.destination} onChange={handleChange} required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                  <datalist id="dests">{DESTINATIONS.map(d => <option key={d} value={d} />)}</datalist>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Distance (km)</label>
                  <input type="number" step="0.1" name="distance_km" value={form.distance_km} onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div></div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Voyages 1ère équipe</label>
                  <input type="number" name="nbr_voyage_1er" value={form.nbr_voyage_1er} onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Voyages 2ème équipe</label>
                  <input type="number" name="nbr_voyage_2e" value={form.nbr_voyage_2e} onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Total Voyages</label>
                  <input type="number" name="total_voyage" value={form.total_voyage} onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Volume (m³) *</label>
                  <input type="number" name="volume_m3" value={form.volume_m3} onChange={handleChange} required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 font-bold" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Camion 1ère équipe</label>
                  <input type="number" name="camion_1er" value={form.camion_1er} onChange={handleChange} placeholder="Nb camions"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Camion 2ème équipe</label>
                  <input type="number" name="camion_2e" value={form.camion_2e} onChange={handleChange} placeholder="Nb camions"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Pelle 1ère équipe</label>
                  <input list="pelles" name="pelle_1er" value={form.pelle_1er} onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                  <datalist id="pelles">{PELLES.map(p => <option key={p} value={p} />)}</datalist>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Pelle 2ème équipe</label>
                  <input list="pelles2" name="pelle_2e" value={form.pelle_2e} onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                  <datalist id="pelles2">{PELLES.map(p => <option key={p} value={p} />)}</datalist>
                </div>
              </div>
              <div className="mt-6 flex gap-3 justify-end">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                  Annuler
                </button>
                <button type="submit" disabled={saving}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {saving ? 'Enregistrement...' : editId ? 'Mettre à jour' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Type</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Tranchée/Panneau</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Destination</th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium">Dist (km)</th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium">Voyages</th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium font-bold">Volume m³</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Pelle</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-400">Chargement...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-400">Aucune donnée pour cette date</td></tr>
              ) : records.map(rec => (
                <tr key={rec.id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="py-2.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                      ${rec.type_materiau === 'PHOSPHATE' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {rec.type_materiau}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-medium">{rec.tranchee} {rec.panneau}</td>
                  <td className="py-2.5 px-4 text-gray-600 max-w-32 truncate">{rec.destination}</td>
                  <td className="py-2.5 px-4 text-right text-gray-500">{rec.distance_km || '-'}</td>
                  <td className="py-2.5 px-4 text-right">
                    <span className="font-mono">{rec.total_voyage}</span>
                    <span className="text-xs text-gray-400 ml-1">({rec.nbr_voyage_1er}+{rec.nbr_voyage_2e})</span>
                  </td>
                  <td className="py-2.5 px-4 text-right font-bold font-mono text-blue-700">{Number(rec.volume_m3).toLocaleString('fr-FR')}</td>
                  <td className="py-2.5 px-4 text-gray-500 text-xs">{rec.pelle_1er || '-'}</td>
                  <td className="py-2.5 px-4">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => handleEdit(rec)} className="text-blue-500 hover:text-blue-700 text-xs">✏️</button>
                      <button onClick={() => handleDelete(rec.id)} className="text-red-400 hover:text-red-600 text-xs">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            {records.length > 0 && (
              <tfoot>
                <tr className="bg-gray-50 border-t-2 border-gray-200">
                  <td colSpan={4} className="py-3 px-4 font-semibold text-gray-700">TOTAL</td>
                  <td className="py-3 px-4 text-right font-bold font-mono">{fmt(totals.voyages)}</td>
                  <td className="py-3 px-4 text-right font-bold font-mono text-blue-700">{fmt(totals.volume)}</td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
