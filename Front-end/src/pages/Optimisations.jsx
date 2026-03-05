import { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';

const PRIORITY_CONFIG = {
  haute: { color: 'bg-red-50 border-red-200', badge: 'bg-red-100 text-red-700', icon: '🔴' },
  moyenne: { color: 'bg-yellow-50 border-yellow-200', badge: 'bg-yellow-100 text-yellow-700', icon: '🟡' },
  info: { color: 'bg-blue-50 border-blue-200', badge: 'bg-blue-100 text-blue-700', icon: '🔵' },
};

export default function Optimisations() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    dashboardAPI.getOptimisations().then(r => {
      setData(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-16 text-gray-400">Analyse en cours...</div>;
  if (!data) return <div className="text-red-500 p-4">Erreur de chargement</div>;

  const suggestions = (data.suggestions || []).filter(s => filter === 'all' || s.priorite === filter);
  const stats = data.stats_analyse;

  const countByPriority = (p) => (data.suggestions || []).filter(s => s.priorite === p).length;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="text-xs text-red-600 mb-1">🔴 Haute priorité</div>
          <div className="text-2xl font-bold text-red-800">{countByPriority('haute')}</div>
          <div className="text-xs text-red-500">actions urgentes</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="text-xs text-yellow-600 mb-1">🟡 Priorité moyenne</div>
          <div className="text-2xl font-bold text-yellow-800">{countByPriority('moyenne')}</div>
          <div className="text-xs text-yellow-500">à traiter</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="text-xs text-blue-600 mb-1">🔵 Informations</div>
          <div className="text-2xl font-bold text-blue-800">{countByPriority('info')}</div>
          <div className="text-xs text-blue-500">points positifs</div>
        </div>
      </div>

      {/* Stats du mois */}
      {stats && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-3">📈 Indicateurs d'Analyse (mois courant)</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-gray-400 text-xs">Jours analysés</div>
              <div className="font-bold text-gray-700 mt-1">{stats.jours}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 text-xs">Volume total</div>
              <div className="font-bold text-gray-700 mt-1">{Number(stats.vol_total || 0).toLocaleString('fr-FR')} m³</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 text-xs">Total voyages</div>
              <div className="font-bold text-gray-700 mt-1">{Number(stats.voyages || 0).toLocaleString('fr-FR')}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 text-xs">Moy. m³/voyage</div>
              <div className={`font-bold mt-1 ${(stats.vol_par_voyage || 0) >= 16 ? 'text-green-600' : 'text-orange-600'}`}>
                {stats.vol_par_voyage ? Number(stats.vol_par_voyage).toFixed(1) : '-'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'haute', 'moyenne', 'info'].map(p => (
          <button key={p} onClick={() => setFilter(p)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${filter === p ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
            {p === 'all' ? 'Toutes' : p === 'haute' ? '🔴 Haute' : p === 'moyenne' ? '🟡 Moyenne' : '🔵 Info'}
            {p !== 'all' && ` (${countByPriority(p)})`}
          </button>
        ))}
      </div>

      {/* Suggestions list */}
      {suggestions.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <div className="text-4xl mb-3">✅</div>
          <div className="text-green-800 font-semibold">Aucune anomalie détectée</div>
          <div className="text-green-600 text-sm mt-1">Les indicateurs sont dans les normes pour cette période</div>
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map((s, i) => {
            const cfg = PRIORITY_CONFIG[s.priorite] || PRIORITY_CONFIG.info;
            return (
              <div key={i} className={`rounded-xl p-5 border ${cfg.color}`}>
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{cfg.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-gray-800">{s.titre}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.badge}`}>
                        {s.priorite}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{s.description}</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white/70 rounded-lg p-2">
                        <div className="text-xs text-gray-400">Situation actuelle</div>
                        <div className="text-sm font-semibold text-gray-700">{s.valeur_actuelle}</div>
                      </div>
                      <div className="bg-white/70 rounded-lg p-2">
                        <div className="text-xs text-gray-400">Objectif</div>
                        <div className="text-sm font-semibold text-green-700">{s.objectif}</div>
                      </div>
                      <div className="bg-white/70 rounded-lg p-2">
                        <div className="text-xs text-gray-400">Gain potentiel</div>
                        <div className="text-sm font-semibold text-blue-700">{s.gain_potentiel}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tips */}
      <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
        <h3 className="font-semibold text-gray-700 mb-3">💡 Bonnes Pratiques Recommandées</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Maintenir un volume moyen ≥ 16 m³ par voyage phosphate</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Objectif production journalière phosphate: 4 000+ m³</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Taux de disponibilité cible: ≥ 85%</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Planifier maintenance préventive en période basse production</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Ratio stérile/phosphate à maintenir sous 1.5</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Saisir les arrêts dès qu'ils surviennent pour un suivi précis</span>
          </div>
        </div>
      </div>
    </div>
  );
}
