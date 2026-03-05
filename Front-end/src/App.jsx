import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Production from './pages/Production';
import Affectations from './pages/Affectations';
import Disponibilite from './pages/Disponibilite';
import Rapports from './pages/Rapports';
import Optimisations from './pages/Optimisations';

const PAGES = {
  dashboard: Dashboard,
  production: Production,
  affectations: Affectations,
  disponibilite: Disponibilite,
  rapports: Rapports,
  optimisations: Optimisations,
};

const NAV = [
  { id: 'dashboard', label: 'Tableau de Bord', icon: '📊' },
  { id: 'production', label: 'Saisie Production', icon: '⛏️' },
  { id: 'affectations', label: 'Affectations', icon: '🚛' },
  { id: 'disponibilite', label: 'Disponibilité', icon: '⚙️' },
  { id: 'rapports', label: 'Rapports', icon: '📋' },
  { id: 'optimisations', label: 'Optimisations', icon: '🎯' },
];

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(true);
  const PageComponent = PAGES[page];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <div className={`${menuOpen ? 'w-64' : 'w-16'} flex-shrink-0 transition-all duration-300 flex flex-col`}
           style={{ background: 'linear-gradient(180deg, #004B8D 0%, #00843D 100%)' }}>
        <div className="p-4 border-b border-white/20 flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 text-base">⛏</div>
          {menuOpen && <div><div className="text-white font-bold text-sm">BenGuerir</div><div className="text-white/60 text-xs">Exploitation Minière</div></div>}
        </div>
        <nav className="flex-1 py-4 px-2">
          {NAV.map(item => (
            <button key={item.id} onClick={() => setPage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all text-left
                ${page === item.id ? 'bg-white/20 text-white font-semibold' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              {menuOpen && <span className="text-sm truncate">{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/20">
          <button onClick={() => setMenuOpen(!menuOpen)} className="w-full flex items-center justify-center text-white/70 hover:text-white py-1 text-sm">
            {menuOpen ? '◀' : '▶'}
          </button>
        </div>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-lg font-bold text-gray-800">{NAV.find(n => n.id === page)?.label}</h1>
            <p className="text-xs text-gray-500">Site de Benguerir — {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <span className="text-xs bg-green-50 border border-green-200 text-green-700 rounded-full px-3 py-1">● Système actif</span>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <PageComponent />
        </main>
      </div>
    </div>
  );
}
