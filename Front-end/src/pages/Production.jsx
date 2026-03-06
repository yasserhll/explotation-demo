import { useState, useEffect, useCallback } from 'react';
import { productionAPI } from '../services/api';

const EMPTY_FORM = {
  date: new Date().toISOString().slice(0,10),
  type_materiau:'PHOSPHATE', niveau:'', tranchee:'', panneau:'',
  destination:'', distance_km:'', nbr_voyage_1er:'', nbr_voyage_2e:'',
  total_voyage:'', volume_m3:'', camion_1er:'', camion_2e:'', pelle_1er:'', pelle_2e:''
};
const DESTINATIONS = ['CRIBLAGE MOBILE','STOCK PSF','STOCK PSF SAFI','STOCK GOUDRON','STOCK BASCULE','STOCK PONT BASCULE','DECHARGE','TREMIE 1','TREMIE 2','TREMIE MOBILE','STOCK ZAGORA'];
const PELLES = ['350-E71','350-E64','480-E49','336-E18','CH-966-E48','CH-760-E22'];
const TRANCHEES = ['TG4','TJ9','TF8','TE9','TE10','TH15','T43','TG3','T39','REPRISE'];
const PANNEAUX = ['P2','P4','P5','P6','P7'];

// ✅ Génère les jours du mois dans le sens 27 → 26 (dernier mois glissant)
function buildMonthDays(year, month) {
  const days = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  // Du 27 du mois précédent au 26 du mois courant
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const daysInPrev = new Date(prevYear, prevMonth, 0).getDate();
  for (let d = 27; d <= daysInPrev; d++) {
    days.push(`${prevYear}-${String(prevMonth).padStart(2,'0')}-${String(d).padStart(2,'0')}`);
  }
  for (let d = 1; d <= 26; d++) {
    days.push(`${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`);
  }
  return days;
}

function fmt(n) { return Number(n||0).toLocaleString('fr-FR'); }

// PDF export using browser print
function exportToPDF(records, date, totals) {
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Rapport Production - ${date}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'DM Sans', Arial, sans-serif; font-size: 11px; color: #1a2332; background: #fff; }
  .header { background: linear-gradient(135deg, #0A1628 0%, #004B8D 60%, #00843D 100%); color: white; padding: 24px 32px; display: flex; justify-content: space-between; align-items: center; }
  .header-left h1 { font-size: 20px; font-weight: 700; letter-spacing: -0.5px; }
  .header-left p { font-size: 11px; opacity: 0.7; margin-top: 2px; }
  .header-right { text-align: right; }
  .header-right .date-badge { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); border-radius: 8px; padding: 6px 14px; font-size: 13px; font-weight: 600; }
  .content { padding: 24px 32px; }
  .kpi-row { display: flex; gap: 16px; margin-bottom: 24px; }
  .kpi { flex: 1; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px 16px; }
  .kpi .label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #64748B; margin-bottom: 4px; }
  .kpi .value { font-size: 20px; font-weight: 700; color: #004B8D; letter-spacing: -0.5px; }
  .kpi.green .value { color: #00843D; }
  .kpi.amber .value { color: #D97706; }
  .section-title { font-size: 13px; font-weight: 700; color: #1a2332; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 2px solid #004B8D; display: flex; align-items: center; gap: 8px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  thead tr { background: #004B8D; color: white; }
  th { padding: 8px 10px; text-align: left; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; }
  tbody tr:nth-child(even) { background: #F8FAFC; }
  tbody tr:hover { background: #EFF6FF; }
  td { padding: 8px 10px; border-bottom: 1px solid #F1F5F9; font-size: 10px; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 9px; font-weight: 700; }
  .phos { background: #DBEAFE; color: #1D4ED8; }
  .ster { background: #FEF3C7; color: #B45309; }
  tfoot tr { background: #1a2332; color: white; }
  tfoot td { font-weight: 700; font-size: 11px; padding: 10px; }
  .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #E2E8F0; display: flex; justify-content: space-between; color: #94A3B8; font-size: 9px; }
  .ocp-tag { font-size: 9px; font-weight: 700; color: #004B8D; text-transform: uppercase; letter-spacing: 1px; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="header">
  <div class="header-left">
    <h1>🏭 Rapport de Production</h1>
    <p>Site Minier BenGuerir — OCP Group</p>
  </div>
  <div class="header-right">
    <div class="date-badge">📅 ${date}</div>
    <div style="margin-top:6px;font-size:10px;opacity:0.6;">Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</div>
  </div>
</div>
<div class="content">
  <div class="kpi-row">
    <div class="kpi">
      <div class="label">Total Lignes</div>
      <div class="value">${records.length}</div>
    </div>
    <div class="kpi">
      <div class="label">Total Voyages</div>
      <div class="value">${fmt(totals.v)}</div>
    </div>
    <div class="kpi green">
      <div class="label">Volume Total</div>
      <div class="value">${fmt(totals.vol)} m³</div>
    </div>
    <div class="kpi amber">
      <div class="label">Phosphate</div>
      <div class="value">${fmt(records.filter(r=>r.type_materiau==='PHOSPHATE').reduce((a,r)=>a+(+r.volume_m3||0),0))} m³</div>
    </div>
    <div class="kpi">
      <div class="label">m³ / Voyage moy.</div>
      <div class="value">${totals.v > 0 ? (totals.vol / totals.v).toFixed(1) : '—'}</div>
    </div>
  </div>
  <div class="section-title">📋 Détail des Lignes de Production</div>
  <table>
    <thead>
      <tr>
        <th>Type</th><th>Tranchée</th><th>Panneau</th><th>Destination</th>
        <th>Dist. km</th><th>V1</th><th>V2</th><th>Total Vg</th>
        <th>Volume m³</th><th>m³/Vg</th><th>Pelle</th>
      </tr>
    </thead>
    <tbody>
      ${records.map(r => `
      <tr>
        <td><span class="badge ${r.type_materiau==='PHOSPHATE'?'phos':'ster'}">${r.type_materiau}</span></td>
        <td><strong>${r.tranchee||'—'}</strong></td>
        <td>${r.panneau||'—'}</td>
        <td>${r.destination||'—'}</td>
        <td>${r.distance_km||'—'}</td>
        <td>${r.nbr_voyage_1er||0}</td>
        <td>${r.nbr_voyage_2e||0}</td>
        <td><strong>${r.total_voyage||0}</strong></td>
        <td><strong>${Number(r.volume_m3||0).toLocaleString('fr-FR')}</strong></td>
        <td>${r.total_voyage > 0 ? (r.volume_m3/r.total_voyage).toFixed(1) : '—'}</td>
        <td>${r.pelle_1er||'—'}</td>
      </tr>`).join('')}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="7">TOTAL JOURNÉE</td>
        <td>${fmt(totals.v)}</td>
        <td>${fmt(totals.vol)} m³</td>
        <td>${totals.v > 0 ? (totals.vol/totals.v).toFixed(1) : '—'}</td>
        <td></td>
      </tr>
    </tfoot>
  </table>
  <div class="footer">
    <span class="ocp-tag">OCP Group — BenGuerir Mining Operations</span>
    <span>Document généré automatiquement — Ne pas diffuser sans autorisation</span>
    <span>Page 1/1</span>
  </div>
</div>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=900,height=700');
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 500);
}

const inputCls = "w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400";

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export default function Production() {
  const now = new Date();
  // ✅ Mois OCP : 27→26 — on stocke l'année+mois de fin (le mois "26")
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1); // 1-12

  const monthDays = buildMonthDays(viewYear, viewMonth);

  // Trouver le jour courant dans les jours du mois, sinon le dernier
  const todayStr = now.toISOString().slice(0,10);
  const defaultDay = monthDays.includes(todayStr) ? todayStr : monthDays[monthDays.length - 1];
  const [selectedDate, setSelectedDate] = useState(defaultDay);

  const [records, setRecords] = useState([]);
  const [daySummaries, setDaySummaries] = useState({}); // {date: {volume, voyages}}
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM, date: defaultDay });
  const [editId, setEditId] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  // Charger résumé du mois pour afficher indicateurs dans la nav
  const loadMonthlySummary = useCallback(() => {
    // On charge toutes les productions du mois en une requête
    const from = monthDays[0];
    const to = monthDays[monthDays.length - 1];
    productionAPI.getAll({ from, to })
      .then(r => {
        const data = r.data.data || [];
        const summaries = {};
        data.forEach(rec => {
          const d = rec.date?.slice(0,10) || rec.date;
          if (!summaries[d]) summaries[d] = { volume: 0, voyages: 0 };
          summaries[d].volume += parseFloat(rec.volume_m3) || 0;
          summaries[d].voyages += parseInt(rec.total_voyage) || 0;
        });
        setDaySummaries(summaries);
      });
  }, [viewYear, viewMonth]);

  const loadDay = useCallback(() => {
    setLoading(true);
    productionAPI.getAll({ date: selectedDate, type: filterType || undefined })
      .then(r => { setRecords(r.data.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [selectedDate, filterType]);

  useEffect(() => { loadMonthlySummary(); }, [viewYear, viewMonth]);
  useEffect(() => { loadDay(); }, [selectedDate, filterType]);

  const handleChange = e => {
    const { name, value } = e.target;
    let upd = { ...form, [name]: value };
    if (name === 'nbr_voyage_1er' || name === 'nbr_voyage_2e') {
      const v1 = parseInt(name === 'nbr_voyage_1er' ? value : form.nbr_voyage_1er) || 0;
      const v2 = parseInt(name === 'nbr_voyage_2e' ? value : form.nbr_voyage_2e) || 0;
      upd.total_voyage = v1 + v2;
      upd.volume_m3 = Math.round((v1 + v2) * 16);
    }
    setForm(upd);
  };

  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true);
    try {
      editId ? await productionAPI.update(editId, form) : await productionAPI.create(form);
      setMsg({ ok: true, text: editId ? 'Ligne mise à jour ✓' : 'Production enregistrée ✓' });
      setShowForm(false); setEditId(null); setForm({ ...EMPTY_FORM, date: selectedDate });
      loadDay(); loadMonthlySummary();
    } catch (err) {
      setMsg({ ok: false, text: 'Erreur: ' + (err.response?.data?.message || err.message) });
    }
    setSaving(false); setTimeout(() => setMsg(null), 3000);
  };

  const handleDelete = async id => {
    if (!confirm('Supprimer cette ligne ?')) return;
    await productionAPI.delete(id);
    loadDay(); loadMonthlySummary();
  };

  const totals = records.reduce((a, r) => ({
    v: a.v + (parseInt(r.total_voyage)||0),
    vol: a.vol + (parseFloat(r.volume_m3)||0)
  }), { v: 0, vol: 0 });

  // Nom du mois OCP (ex: "Fév 2026")
  const monthLabel = new Date(viewYear, viewMonth - 1, 1)
    .toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });

  const prevMonth = () => {
    if (viewMonth === 1) { setViewYear(y => y-1); setViewMonth(12); }
    else setViewMonth(m => m-1);
  };
  const nextMonth = () => {
    if (viewMonth === 12) { setViewYear(y => y+1); setViewMonth(1); }
    else setViewMonth(m => m+1);
  };

  // Day color helpers
  const getDayColor = d => {
    const s = daySummaries[d];
    if (!s || s.volume === 0) return null;
    if (s.volume >= 4000) return '#00843D';
    if (s.volume >= 2000) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div className="flex gap-5 max-w-full">
      {/* ===== SIDEBAR CALENDAR ===== */}
      <div className="flex-shrink-0 w-72">
        <div className="bg-white rounded-2xl border border-gray-100/80 overflow-hidden sticky top-4"
          style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
          {/* Month nav */}
          <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100"
            style={{ background: 'linear-gradient(135deg, #0A1628, #004B8D)' }}>
            <button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div className="text-center">
              <div className="text-white font-bold text-sm">{monthLabel}</div>
              <div className="text-white/50 text-xs">Cycle 27 → 26</div>
            </div>
            <button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          {/* Legend */}
          <div className="px-4 py-2 bg-gray-50/80 border-b border-gray-100 flex gap-3 text-xs">
            {[['#00843D','≥4000 m³'],['#F59E0B','≥2000'],['#EF4444','<2000']].map(([c,l]) => (
              <div key={l} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: c }}/>
                <span className="text-gray-500">{l}</span>
              </div>
            ))}
          </div>

          {/* Day list */}
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
            {monthDays.map((d, i) => {
              const isSelected = d === selectedDate;
              const summary = daySummaries[d];
              const color = getDayColor(d);
              const dayNum = parseInt(d.slice(8));
              const isSep = i === 0 || d.slice(5,7) !== monthDays[i-1]?.slice(5,7);
              const dayName = new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'short' });
              const isWeekend = ['sam','dim'].includes(dayName.toLowerCase());

              return (
                <div key={d}>
                  {isSep && (
                    <div className="px-4 py-1.5 bg-gray-50 border-y border-gray-100">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => setSelectedDate(d)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 transition-all text-left"
                    style={{
                      background: isSelected ? 'linear-gradient(135deg, #004B8D, #0066CC)' : isWeekend ? '#FAFAFA' : 'white',
                      borderLeft: isSelected ? '3px solid #00843D' : color ? `3px solid ${color}` : '3px solid transparent',
                    }}>
                    {/* Day number */}
                    <div className="flex-shrink-0 text-center w-8">
                      <div className={`text-base font-bold ${isSelected ? 'text-white' : isWeekend ? 'text-gray-300' : 'text-gray-800'}`}>{String(dayNum).padStart(2,'0')}</div>
                      <div className={`text-xs ${isSelected ? 'text-white/60' : 'text-gray-400'}`}>{dayName}</div>
                    </div>
                    {/* Summary */}
                    <div className="flex-1 min-w-0">
                      {summary && summary.volume > 0 ? (
                        <>
                          <div className={`text-xs font-bold ${isSelected ? 'text-white' : ''}`} style={{ color: isSelected ? 'white' : color }}>
                            {Number(summary.volume).toLocaleString('fr-FR')} m³
                          </div>
                          <div className={`text-xs ${isSelected ? 'text-white/60' : 'text-gray-400'}`}>
                            {summary.voyages} voyages
                          </div>
                        </>
                      ) : (
                        <div className={`text-xs ${isSelected ? 'text-white/50' : 'text-gray-300'}`}>—</div>
                      )}
                    </div>
                    {isSelected && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-3.5 h-3.5 flex-shrink-0 opacity-70">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 min-w-0 space-y-4">
        {msg && (
          <div className={`rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 ${msg.ok ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
            <span>{msg.ok ? '✓' : '✕'}</span> {msg.text}
          </div>
        )}

        {/* Toolbar */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100/80 flex flex-wrap gap-3 items-center justify-between"
          style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center gap-3">
            <div>
              <div className="text-lg font-bold text-gray-900">
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('fr-FR', { weekday:'long', day:'2-digit', month:'long', year:'numeric' })}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">{records.length} ligne(s) de production</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 cursor-pointer">
              <option value="">Tous matériaux</option>
              <option value="PHOSPHATE">Phosphate</option>
              <option value="STERILE">Stérile</option>
            </select>
            {records.length > 0 && (
              <button onClick={() => exportToPDF(records, selectedDate, totals)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #DC2626, #B91C1C)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
                PDF
              </button>
            )}
            <button onClick={() => { setForm({ ...EMPTY_FORM, date: selectedDate }); setEditId(null); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #004B8D, #0066CC)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Ajouter
            </button>
          </div>
        </div>

        {/* KPI row */}
        {records.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Voyages', val: fmt(totals.v), color: '#004B8D', bg: '#EFF6FF' },
              { label: 'Volume Total', val: fmt(Math.round(totals.vol)) + ' m³', color: '#00843D', bg: '#F0FDF4' },
              { label: 'm³ / Voyage', val: totals.v > 0 ? (totals.vol/totals.v).toFixed(1) : '—', color: '#7C3AED', bg: '#F5F3FF' },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl p-4 flex items-center justify-between" style={{ background: s.bg, border: `1px solid ${s.color}22` }}>
                <span className="text-sm font-medium" style={{ color: s.color }}>{s.label}</span>
                <span className="text-xl font-bold stat-num" style={{ color: s.color }}>{s.val}</span>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100/80 overflow-hidden" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #F1F5F9' }}>
                  {['Type','Tranchée','Panneau','Destination','V1','V2','Total Vg','Volume m³','m³/Vg','Pelle','Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={11} className="text-center py-12">
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/>
                      <span className="text-sm">Chargement...</span>
                    </div>
                  </td></tr>
                ) : records.length === 0 ? (
                  <tr><td colSpan={11} className="text-center py-14">
                    <div className="flex flex-col items-center gap-2 text-gray-300">
                      <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.2">
                        <rect x="6" y="6" width="36" height="36" rx="4"/>
                        <line x1="6" y1="18" x2="42" y2="18"/>
                        <line x1="18" y1="6" x2="18" y2="42"/>
                      </svg>
                      <div className="text-sm font-medium">Aucune production pour cette date</div>
                      <div className="text-xs">Cliquez sur "Ajouter" pour saisir des données</div>
                    </div>
                  </td></tr>
                ) : records.map(rec => {
                  const mpv = rec.total_voyage > 0 ? (rec.volume_m3/rec.total_voyage).toFixed(1) : '—';
                  return (
                    <tr key={rec.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${rec.type_materiau === 'PHOSPHATE' ? 'badge-phosphate' : 'badge-sterile'}`}>
                          {rec.type_materiau === 'PHOSPHATE' ? 'PHOS' : 'STÉR'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-sm text-gray-800">{rec.tranchee||'—'}</td>
                      <td className="py-3 px-3 text-sm text-gray-500">{rec.panneau||'—'}</td>
                      <td className="py-3 px-3 text-sm text-gray-600 max-w-28 truncate">{rec.destination||'—'}</td>
                      <td className="py-3 px-3 text-sm stat-num text-gray-600">{rec.nbr_voyage_1er||0}</td>
                      <td className="py-3 px-3 text-sm stat-num text-gray-600">{rec.nbr_voyage_2e||0}</td>
                      <td className="py-3 px-3 text-sm font-bold stat-num">{rec.total_voyage||0}</td>
                      <td className="py-3 px-3 text-sm font-bold text-blue-700 stat-num">{Number(rec.volume_m3||0).toLocaleString('fr-FR')}</td>
                      <td className="py-3 px-3 text-sm font-semibold stat-num" style={{ color: parseFloat(mpv) >= 16 ? '#00843D' : parseFloat(mpv) >= 14 ? '#F59E0B' : '#EF4444' }}>
                        {mpv}
                      </td>
                      <td className="py-3 px-3 text-xs text-gray-400 whitespace-nowrap">{rec.pelle_1er||'—'}</td>
                      <td className="py-3 px-3">
                        <div className="flex gap-1">
                          <button onClick={() => { setForm({...rec}); setEditId(rec.id); setShowForm(true); }}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button onClick={() => handleDelete(rec.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {records.length > 0 && (
                <tfoot>
                  <tr style={{ background: '#1A2332', borderTop: '2px solid #E2E8F0' }}>
                    <td colSpan={6} className="py-3 px-3 text-sm font-bold text-white">TOTAL JOURNÉE</td>
                    <td className="py-3 px-3 text-sm font-bold text-white stat-num">{fmt(totals.v)}</td>
                    <td className="py-3 px-3 text-sm font-bold text-blue-300 stat-num">{fmt(Math.round(totals.vol))} m³</td>
                    <td className="py-3 px-3 text-sm font-bold text-emerald-300 stat-num">
                      {totals.v > 0 ? (totals.vol/totals.v).toFixed(1) : '—'}
                    </td>
                    <td colSpan={2}/>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>

      {/* ===== MODAL FORM ===== */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
            <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-2xl">
              <div>
                <h2 className="text-base font-bold text-gray-900">{editId ? 'Modifier la ligne' : 'Nouvelle Ligne de Production'}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{selectedDate}</p>
              </div>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 text-sm">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-5">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Date *"><input type="date" name="date" value={form.date} onChange={handleChange} required className={inputCls}/></Field>
                <Field label="Type *">
                  <select name="type_materiau" value={form.type_materiau} onChange={handleChange} className={inputCls}>
                    <option value="PHOSPHATE">PHOSPHATE</option>
                    <option value="STERILE">STÉRILE</option>
                  </select>
                </Field>
                <Field label="Tranchée">
                  <input list="tranchees-list" name="tranchee" value={form.tranchee} onChange={handleChange} placeholder="Ex: TG4" className={inputCls}/>
                  <datalist id="tranchees-list">{TRANCHEES.map(t => <option key={t} value={t}/>)}</datalist>
                </Field>
                <Field label="Panneau">
                  <select name="panneau" value={form.panneau} onChange={handleChange} className={inputCls}>
                    <option value="">—</option>{PANNEAUX.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </Field>
                <Field label="Niveau"><input name="niveau" value={form.niveau} onChange={handleChange} placeholder="Ex: C4" className={inputCls}/></Field>
                <Field label="Destination *">
                  <input list="dests-list" name="destination" value={form.destination} onChange={handleChange} required placeholder="Choisir..." className={inputCls}/>
                  <datalist id="dests-list">{DESTINATIONS.map(d => <option key={d} value={d}/>)}</datalist>
                </Field>
                <Field label="Distance (km)"><input type="number" step="0.1" name="distance_km" value={form.distance_km} onChange={handleChange} className={inputCls}/></Field>
                <div/>
                <Field label="Voyages 1ère équipe"><input type="number" name="nbr_voyage_1er" value={form.nbr_voyage_1er} onChange={handleChange} className={inputCls}/></Field>
                <Field label="Voyages 2ème équipe"><input type="number" name="nbr_voyage_2e" value={form.nbr_voyage_2e} onChange={handleChange} className={inputCls}/></Field>
                <Field label="Total Voyages"><input type="number" name="total_voyage" value={form.total_voyage} readOnly className={inputCls + ' bg-blue-50'}/></Field>
                <Field label="Volume (m³) *"><input type="number" name="volume_m3" value={form.volume_m3} onChange={handleChange} required className={inputCls + ' font-bold'}/></Field>
                <Field label="Camions 1ère équipe"><input type="number" name="camion_1er" value={form.camion_1er} onChange={handleChange} placeholder="Nb camions" className={inputCls}/></Field>
                <Field label="Camions 2ème équipe"><input type="number" name="camion_2e" value={form.camion_2e} onChange={handleChange} placeholder="Nb camions" className={inputCls}/></Field>
                <Field label="Pelle 1ère équipe">
                  <input list="pelles1-list" name="pelle_1er" value={form.pelle_1er} onChange={handleChange} className={inputCls}/>
                  <datalist id="pelles1-list">{PELLES.map(p => <option key={p} value={p}/>)}</datalist>
                </Field>
                <Field label="Pelle 2ème équipe">
                  <input list="pelles2-list" name="pelle_2e" value={form.pelle_2e} onChange={handleChange} className={inputCls}/>
                  <datalist id="pelles2-list">{PELLES.map(p => <option key={p} value={p}/>)}</datalist>
                </Field>
              </div>
              <div className="mt-5 flex gap-3 justify-end pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">Annuler</button>
                <button type="submit" disabled={saving} className="px-6 py-2 text-sm font-semibold text-white rounded-xl disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #004B8D, #0066CC)' }}>
                  {saving ? 'Enregistrement...' : editId ? 'Mettre à jour' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
