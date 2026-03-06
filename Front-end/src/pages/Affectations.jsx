import { useState, useEffect } from 'react';
import { affectationAPI } from '../services/api';

const STATUS_CONFIG = {
  actif:       { bg: '#F0FDF4', border: '#BBF7D0', text: '#166534', dot: '#22C55E', label: 'Actif' },
  en_panne:    { bg: '#FFF1F2', border: '#FECDD3', text: '#BE123C', dot: '#EF4444', label: 'En panne' },
  arret:       { bg: '#F8FAFC', border: '#E2E8F0', text: '#475569', dot: '#94A3B8', label: 'Arrêt' },
  maintenance: { bg: '#FFFBEB', border: '#FDE68A', text: '#B45309', dot: '#F59E0B', label: 'Maintenance' },
  disponible:  { bg: '#F0FDF4', border: '#BBF7D0', text: '#166534', dot: '#22C55E', label: 'Disponible' },
};

function StatusBadge({ statut }) {
  const cfg = STATUS_CONFIG[statut] || STATUS_CONFIG.arret;
  return (
    <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.text }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }}/>
      {cfg.label}
    </span>
  );
}

export default function Affectations() {
  const [affectations, setAffectations] = useState([]);
  const [engins, setEngins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editRow, setEditRow] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([affectationAPI.getAll(null), affectationAPI.getEngins()])
      .then(([a, e]) => { setAffectations(a.data.data || []); setEngins(e.data.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleSaveRow = async row => {
    setSaving(true);
    try {
      row.id ? await affectationAPI.update(row.id, row) : await affectationAPI.create({ ...row, date: null });
      setEditRow(null); setMsg({ ok: true, text: 'Affectation sauvegardée ✓' }); load();
    } catch { setMsg({ ok: false, text: 'Erreur lors de la sauvegarde' }); }
    setSaving(false); setTimeout(() => setMsg(null), 3000);
  };

  const handleDelete = async id => { if (!confirm('Supprimer ?')) return; await affectationAPI.delete(id); load(); };
  const handleEnginStatus = async (engin, status) => { await affectationAPI.updateEngin(engin.id, { statut: status }); load(); };

  // Stats
  const actifs = affectations.filter(a => a.statut === 'actif').length;
  const pannes = affectations.filter(a => a.statut === 'en_panne').length;
  const arrets = affectations.filter(a => a.statut === 'arret').length;

  const inputCls = "w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm";

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {msg && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium fade-up flex items-center gap-2 ${msg.ok ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
          {msg.text}
        </div>
      )}

      {/* Header bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100/80 flex items-center justify-between" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
        <div className="flex gap-5">
          {[
            { val: actifs, label: 'En service', color: '#166534' },
            { val: pannes, label: 'En panne', color: '#BE123C' },
            { val: arrets, label: 'En arrêt', color: '#64748B' },
            { val: affectations.length, label: 'Total véhicules', color: '#004B8D' },
          ].map((s, i) => (
            <div key={i} className="text-center px-3">
              <div className="text-2xl font-bold stat-num" style={{ color: s.color }}>{s.val}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>
        <button onClick={() => setEditRow({ id: null, chauffeur_principal: '', camion_code: '', chauffeur_secondaire: '', type_vehicule: 'CAMION', statut: 'actif' })}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #004B8D, #0066CC)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Ajouter
        </button>
      </div>

      {/* Modal */}
      {editRow !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">{editRow.id ? 'Modifier' : 'Nouvelle Affectation'}</h2>
              <button onClick={() => setEditRow(null)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 text-sm">✕</button>
            </div>
            <div className="p-5 space-y-4">
              {[
                { label: 'N° Camion', key: 'camion_code', placeholder: 'Ex: D183' },
                { label: 'Conducteur 1ère équipe', key: 'chauffeur_principal', placeholder: 'Nom du conducteur' },
                { label: 'Conducteur 2ème équipe', key: 'chauffeur_secondaire', placeholder: 'Nom du conducteur' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">{f.label}</label>
                  <input value={editRow[f.key] || ''} onChange={e => setEditRow({ ...editRow, [f.key]: e.target.value })} placeholder={f.placeholder} className={inputCls}/>
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Type Véhicule</label>
                <select value={editRow.type_vehicule} onChange={e => setEditRow({ ...editRow, type_vehicule: e.target.value })} className={inputCls}>
                  <option value="CAMION">Camion</option>
                  <option value="TOMBEREAU">Tombereau</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Statut</label>
                <select value={editRow.statut} onChange={e => setEditRow({ ...editRow, statut: e.target.value })} className={inputCls}>
                  <option value="actif">Actif</option>
                  <option value="en_panne">En panne</option>
                  <option value="arret">Arrêt</option>
                </select>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={() => setEditRow(null)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">Annuler</button>
              <button onClick={() => handleSaveRow(editRow)} disabled={saving} className="px-5 py-2 text-sm font-semibold text-white rounded-xl disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #004B8D, #0066CC)' }}>
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Camions table */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100/80 overflow-hidden" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Flotte de Camions</h3>
            <p className="text-xs text-gray-400 mt-0.5">Affectations permanentes — {affectations.length} véhicules</p>
          </div>
          <div className="overflow-auto" style={{ maxHeight: '480px' }}>
            {loading ? <div className="text-center py-10 text-gray-400 text-sm">Chargement...</div> : (
              <table className="w-full">
                <thead><tr style={{ background: '#F8FAFC' }}>
                  {['Camion','Conducteur 1','Conducteur 2','Type','Statut',''].map(h => <th key={h} className="text-left py-2.5 px-4 text-xs font-bold text-gray-500 uppercase">{h}</th>)}
                </tr></thead>
                <tbody>
                  {affectations.map(aff => (
                    <tr key={aff.id} className="border-t border-gray-50 table-row-hover">
                      <td className="py-2.5 px-4 text-sm font-bold text-blue-700 stat-num">{aff.camion_code}</td>
                      <td className="py-2.5 px-4 text-sm text-gray-700">{aff.chauffeur_principal || '—'}</td>
                      <td className="py-2.5 px-4 text-xs text-gray-500">{aff.chauffeur_secondaire || '—'}</td>
                      <td className="py-2.5 px-4 text-xs text-gray-500">{aff.type_vehicule || 'CAMION'}</td>
                      <td className="py-2.5 px-4"><StatusBadge statut={aff.statut}/></td>
                      <td className="py-2.5 px-4">
                        <div className="flex gap-1.5">
                          <button onClick={() => setEditRow({ ...aff })} className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button onClick={() => handleDelete(aff.id)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Engins */}
        <div className="bg-white rounded-2xl border border-gray-100/80 overflow-hidden" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Engins de Chantier</h3>
            <p className="text-xs text-gray-400 mt-0.5">Pelles & niveleuses</p>
          </div>
          <div className="p-4 space-y-3 overflow-auto" style={{ maxHeight: '480px' }}>
            {engins.map(engin => (
              <div key={engin.id} className="p-3 rounded-xl" style={{ background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-bold text-sm text-gray-800">{engin.code}</div>
                    <div className="text-xs text-gray-400">{engin.type} • {engin.modele}</div>
                  </div>
                  <select value={engin.statut || 'actif'} onChange={e => handleEnginStatus(engin, e.target.value)}
                    className="text-xs border rounded-lg px-2 py-1 font-semibold cursor-pointer"
                    style={{ background: (STATUS_CONFIG[engin.statut] || STATUS_CONFIG.actif).bg, color: (STATUS_CONFIG[engin.statut] || STATUS_CONFIG.actif).text, borderColor: (STATUS_CONFIG[engin.statut] || STATUS_CONFIG.actif).border }}>
                    <option value="actif">✓ Actif</option>
                    <option value="en_panne">✕ En panne</option>
                    <option value="maintenance">🔧 Maintenance</option>
                  </select>
                </div>
                <div className="flex flex-col gap-0.5">
                  {[engin.chauffeur_principal, engin.chauffeur_secondaire].filter(Boolean).map((c, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-gray-500">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 text-gray-300"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
