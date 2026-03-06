import { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';

const PRIORITY = {
  haute:   { bg: '#FFF1F2', border: '#FECDD3', badge: '#FEE2E2', badgeText: '#BE123C', icon: '🔴', label: 'Critique' },
  moyenne: { bg: '#FFFBEB', border: '#FDE68A', badge: '#FEF3C7', badgeText: '#B45309', icon: '⚠', label: 'Attention' },
  info:    { bg: '#EFF6FF', border: '#BFDBFE', badge: '#DBEAFE', badgeText: '#1D4ED8', icon: '💡', label: 'Info' },
};

export default function Optimisations() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    dashboardAPI.getOptimisations()
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"/>
        <span className="text-sm text-gray-400">Analyse en cours...</span>
      </div>
    </div>
  );

  // ✅ Clés exactes de DashboardController::optimisations()
  // { month, nb_suggestions, suggestions: [{type, priorite, titre, detail, action}] }
  const suggestions = (data?.suggestions || []).filter(s => filter === 'all' || s.priorite === filter);
  const count = p => (data?.suggestions || []).filter(s => s.priorite === p).length;

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { p: 'haute',   label: 'Critique',  color: '#BE123C', bg: '#FFF1F2', border: '#FECDD3' },
          { p: 'moyenne', label: 'Attention', color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
          { p: 'info',    label: 'Positif',   color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
        ].map(s => (
          <div key={s.p} className="rounded-2xl p-5 fade-up" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
            <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: s.color }}>{s.label}</div>
            <div className="text-4xl font-black stat-num" style={{ color: s.color }}>{count(s.p)}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[['all','Toutes'],['haute','🔴 Critique'],['moyenne','⚠ Attention'],['info','💡 Info']].map(([p, label]) => (
          <button key={p} onClick={() => setFilter(p)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === p ? 'text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            style={filter === p ? { background: p === 'all' ? '#1A2332' : p === 'haute' ? '#BE123C' : p === 'moyenne' ? '#B45309' : '#1D4ED8' } : {}}>
            {label} {p !== 'all' && `(${count(p)})`}
          </button>
        ))}
      </div>

      {/* Suggestions */}
      {suggestions.length === 0 ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-10 text-center">
          <div className="text-5xl mb-3">✅</div>
          <div className="text-emerald-800 font-bold text-lg">Aucune anomalie détectée</div>
          <div className="text-emerald-600 text-sm mt-2">
            {data?.message || 'Les indicateurs sont dans les normes pour cette période'}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map((s, i) => {
            const cfg = PRIORITY[s.priorite] || PRIORITY.info;
            return (
              <div key={i} className="rounded-2xl p-5 fade-up" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                <div className="flex items-start gap-4">
                  <div className="text-2xl mt-0.5">{cfg.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-bold text-gray-900">{s.titre}</h3>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: cfg.badge, color: cfg.badgeText }}>{cfg.label}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">{s.detail}</p>
                    {s.action && (
                      <div className="bg-white/60 rounded-xl p-3">
                        <div className="text-xs text-gray-400 mb-1">Action recommandée</div>
                        <div className="text-sm font-medium text-gray-700">{s.action}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Best practices */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100/80" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
        <h3 className="font-semibold text-gray-800 mb-4">Bonnes Pratiques — Site BenGuerir</h3>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          {[
            'Maintenir un volume moyen ≥ 16 m³ par voyage phosphate',
            'Objectif production journalière phosphate : 4 000+ m³',
            'Taux de disponibilité cible : ≥ 85%',
            'Planifier la maintenance préventive en période basse',
            'Ratio stérile/phosphate à maintenir sous 0.6',
            "Saisir les arrêts dès qu'ils surviennent pour un suivi précis",
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">✓</span>
              <span className="text-sm text-gray-600 leading-relaxed">{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
