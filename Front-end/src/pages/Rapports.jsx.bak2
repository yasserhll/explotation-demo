import { useState, useEffect, useRef } from 'react';
import { rotationAPI, arretAPI } from '../services/api';

const fmt = n => Number(n || 0).toLocaleString('fr-FR');
const fmtDec = (n, d = 1) => Number(n || 0).toFixed(d).replace('.', ',');

const MONTH_NAMES = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

function ocpMonthRange(year, month) {
  const y = parseInt(year), m = parseInt(month);
  return {
    from: new Date(m === 1 ? y - 1 : y, m === 1 ? 11 : m - 2, 27).toISOString().slice(0, 10),
    to: new Date(y, m - 1, 26).toISOString().slice(0, 10),
  };
}

function fmtDateFR(iso) {
  if (!iso) return '';
  try {
    return new Date(iso.slice(0, 10) + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  } catch { return iso; }
}

function fmtDateShort(iso) {
  if (!iso) return '';
  try {
    return new Date(iso.slice(0, 10) + 'T12:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  } catch { return iso; }
}

function calcFromRotations(rotations) {
  const vgsPhos = rotations.reduce((s, r) =>
    s + (r.phosphate_p1a_vgs || 0) + (r.phosphate_p1b_vgs || 0) +
    (r.phosphate_p2a_vgs || 0) + (r.phosphate_p2b_vgs || 0), 0);
  const vgsSter = rotations.reduce((s, r) =>
    s + (r.sterile_p1a_vgs || 0) + (r.sterile_p1b_vgs || 0) +
    (r.sterile_p2a_vgs || 0) + (r.sterile_p2b_vgs || 0), 0);
  return {
    voyages_phosphate: vgsPhos, voyages_sterile: vgsSter,
    total_voyages: vgsPhos + vgsSter,
    volume_phosphate: vgsPhos * 16, volume_sterile: vgsSter * 14,
    total_volume: vgsPhos * 16 + vgsSter * 14,
  };
}

function getPanneauRows(rotations) {
  const map = {};
  rotations.forEach(r => {
    [
      { panneau: r.sterile_p1a_panneau, km: r.sterile_p1a_km, vgs: r.sterile_p1a_vgs, type: 'STERILE', poste: 1 },
      { panneau: r.sterile_p1b_panneau, km: r.sterile_p1b_km, vgs: r.sterile_p1b_vgs, type: 'STERILE', poste: 1 },
      { panneau: r.sterile_p2a_panneau, km: r.sterile_p2a_km, vgs: r.sterile_p2a_vgs, type: 'STERILE', poste: 2 },
      { panneau: r.sterile_p2b_panneau, km: r.sterile_p2b_km, vgs: r.sterile_p2b_vgs, type: 'STERILE', poste: 2 },
      { panneau: r.phosphate_p1a_panneau, km: r.phosphate_p1a_km, vgs: r.phosphate_p1a_vgs, type: 'PHOSPHATE', poste: 1 },
      { panneau: r.phosphate_p1b_panneau, km: r.phosphate_p1b_km, vgs: r.phosphate_p1b_vgs, type: 'PHOSPHATE', poste: 1 },
      { panneau: r.phosphate_p2a_panneau, km: r.phosphate_p2a_km, vgs: r.phosphate_p2a_vgs, type: 'PHOSPHATE', poste: 2 },
      { panneau: r.phosphate_p2b_panneau, km: r.phosphate_p2b_km, vgs: r.phosphate_p2b_vgs, type: 'PHOSPHATE', poste: 2 },
    ].forEach(({ panneau, km, vgs, type, poste }) => {
      if (!panneau || !vgs) return;
      const parts = panneau.split('/').map(s => s.trim());
      const dest = parts[1] || parts[0];
      const tranchee = parts[0];
      const key = `${type}||${tranchee}||${dest}`;
      if (!map[key]) map[key] = { type, tranchee, dest, km: parseFloat(km) || 0, vgs_1er: 0, vgs_2e: 0 };
      if (poste === 1) map[key].vgs_1er += (vgs || 0);
      else map[key].vgs_2e += (vgs || 0);
    });
  });
  return Object.values(map).map(row => ({
    ...row,
    total: row.vgs_1er + row.vgs_2e,
    volume: (row.vgs_1er + row.vgs_2e) * (row.type === 'PHOSPHATE' ? 16 : 14),
  }));
}

function getDateTrancheeMap(rotations) {
  const map = {};
  rotations.forEach(r => {
    const d = r._date || (r.date ? r.date.slice(0, 10) : null);
    if (!d) return;
    [
      { panneau: r.sterile_p1a_panneau, vgs: r.sterile_p1a_vgs, type: 'STERILE' },
      { panneau: r.sterile_p1b_panneau, vgs: r.sterile_p1b_vgs, type: 'STERILE' },
      { panneau: r.sterile_p2a_panneau, vgs: r.sterile_p2a_vgs, type: 'STERILE' },
      { panneau: r.sterile_p2b_panneau, vgs: r.sterile_p2b_vgs, type: 'STERILE' },
      { panneau: r.phosphate_p1a_panneau, vgs: r.phosphate_p1a_vgs, type: 'PHOSPHATE' },
      { panneau: r.phosphate_p1b_panneau, vgs: r.phosphate_p1b_vgs, type: 'PHOSPHATE' },
      { panneau: r.phosphate_p2a_panneau, vgs: r.phosphate_p2a_vgs, type: 'PHOSPHATE' },
      { panneau: r.phosphate_p2b_panneau, vgs: r.phosphate_p2b_vgs, type: 'PHOSPHATE' },
    ].forEach(({ panneau, vgs, type }) => {
      if (!panneau || !vgs) return;
      const parts = panneau.split('/').map(s => s.trim());
      const k = `${type}||${parts[0]}||${parts[1] || parts[0]}`;
      if (!map[k]) map[k] = {};
      map[k][d] = (map[k][d] || 0) + (vgs || 0);
    });
  });
  return map;
}

const TH = ({ children, style = {} }) => (
  <th style={{ padding: '7px 9px', fontSize: '10px', fontWeight: 700, color: 'white', whiteSpace: 'nowrap', textAlign: 'left', letterSpacing: '0.3px', ...style }}>
    {children}
  </th>
);
const TD = ({ children, style = {} }) => (
  <td style={{ padding: '6px 9px', fontSize: '11px', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap', ...style }}>
    {children}
  </td>
);

// ══════════════════════════════════════════════════
// RAPPORT JOURNALIER
// ══════════════════════════════════════════════════
function RapportJournalier() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [rotations, setRotations] = useState([]);
  const [arrets, setArrets] = useState([]);
  const [dispo, setDispo] = useState(null);
  const [loading, setLoading] = useState(false);
  const printRef = useRef(null);

  const load = async (d) => {
    setLoading(true);
    try {
      const [rot, arr, dp] = await Promise.all([
        rotationAPI.getByDate(d),
        arretAPI.getAll({ from: d, to: d }),
        arretAPI.getDisponibilite({ from: d, to: d }),
      ]);
      setRotations(rot.data.rotations || []);
      setArrets(arr.data.data || []);
      setDispo(dp.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(date); }, [date]);

  const totals = calcFromRotations(rotations);
  const panneauRows = getPanneauRows(rotations);
  const phosphateRows = panneauRows.filter(r => r.type === 'PHOSPHATE');
  const sterileRows = panneauRows.filter(r => r.type === 'STERILE');
  const totalPhos = { vgs: phosphateRows.reduce((s, r) => s + r.total, 0), vol: phosphateRows.reduce((s, r) => s + r.volume, 0) };
  const totalSter = { vgs: sterileRows.reduce((s, r) => s + r.total, 0), vol: sterileRows.reduce((s, r) => s + r.volume, 0) };

  const handlePrint = () => {
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>Rapport ${date}</title><style>
      body{font-family:Arial,sans-serif;font-size:10px;color:#1a2332;padding:20px}
      h1{font-size:15px;font-weight:800;margin-bottom:2px}
      table{width:100%;border-collapse:collapse;margin-bottom:14px}
      th{background:#004B8D;color:white;padding:5px 7px;text-align:left;font-size:9px}
      td{padding:4px 7px;border-bottom:1px solid #E5E7EB;font-size:9px}
      tr:nth-child(even)td{background:#F8FAFC}
      .tot td{background:#1a2332;color:white;font-weight:700}
      .sec{font-size:12px;font-weight:700;margin:12px 0 4px;color:#004B8D;border-bottom:2px solid #004B8D;padding-bottom:3px}
      @media print{@page{size:A4 landscape}}
    </style></head><body>${printRef.current?.innerHTML || ''}</body></html>`);
    w.document.close();
    setTimeout(() => { w.print(); w.close(); }, 400);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-4 border border-gray-100 flex flex-wrap items-center gap-4 justify-between" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
        <div>
          <h2 className="text-base font-bold text-gray-800">Rapport de Production Journalière</h2>
          <p className="text-xs text-gray-400">Site Minier BenGuerir — OCP Group</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#004B8D,#0066CC)' }}>
            🖨 Imprimer
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div ref={printRef} className="space-y-4">
          {/* HEADER */}
          <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg,#0A1628,#004B8D,#00843D)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
            <div className="px-6 py-5">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-xl font-black text-white">Rapport de Production Journalière</h1>
                  <p className="text-white/70 text-sm mt-0.5">Site de Benguerir — {fmtDateFR(date)}</p>
                </div>
                <div className="bg-white/15 border border-white/30 rounded-xl px-5 py-3 text-right">
                  <div className="text-white/60 text-xs uppercase tracking-wider">Total Voyages</div>
                  <div className="text-3xl font-black text-white">{fmt(totals.total_voyages)}</div>
                  <div className="text-white/50 text-xs">{fmt(totals.total_volume)} m³</div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3 mt-4">
                {[
                  { l: 'Voyages Phosphate', v: fmt(totals.voyages_phosphate), s: `${fmt(totals.volume_phosphate)} m³`, c: '#93C5FD' },
                  { l: 'Voyages Stérile', v: fmt(totals.voyages_sterile), s: `${fmt(totals.volume_sterile)} m³`, c: '#FDE68A' },
                  { l: 'Camions en activité', v: rotations.length, s: 'rotations saisies', c: '#6EE7B7' },
                  { l: 'Taux Disponibilité', v: `${dispo?.taux_disponibilite_global ?? '—'}%`, s: `${arrets.length} arrêt(s)`, c: '#FCA5A5' },
                ].map((k, i) => (
                  <div key={i} className="bg-white/10 rounded-xl p-3 border border-white/20">
                    <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: k.c + 'AA' }}>{k.l}</div>
                    <div style={{ fontSize: '22px', fontWeight: 900, color: k.c, marginTop: '4px' }}>{k.v}</div>
                    <div style={{ fontSize: '11px', color: k.c + '80', marginTop: '2px' }}>{k.s}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* PHOSPHATE */}
          {phosphateRows.length > 0 && (
            <div className="bg-white rounded-2xl overflow-hidden border border-blue-100" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
              <div className="flex items-center gap-3 px-5 py-3 border-b border-blue-100" style={{ background: '#F0F6FF' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#1D4ED8', display: 'inline-block' }} />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: '1px' }}>Phosphate</span>
                <span className="ml-auto" style={{ fontSize: '11px', fontWeight: 700, color: '#1D4ED8', background: '#DBEAFE', border: '1px solid #BFDBFE', padding: '2px 10px', borderRadius: '20px' }}>
                  {fmt(totalPhos.vgs)} voyages · {fmt(totalPhos.vol)} m³
                </span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#1D4ED8' }}>
                      {['Niveau / Tranchée', 'Destination', 'Distance km', 'Vgs 1er Poste', 'Vgs 2e Poste', 'Total Voyages', 'Volume m³'].map(h => <TH key={h}>{h}</TH>)}
                    </tr>
                  </thead>
                  <tbody>
                    {phosphateRows.map((row, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? '#EFF6FF' : 'white' }}>
                        <TD style={{ fontWeight: 700, color: '#1D4ED8' }}>{row.tranchee}</TD>
                        <TD>{row.dest}</TD>
                        <TD style={{ textAlign: 'center', fontFamily: 'monospace' }}>{fmtDec(row.km)}</TD>
                        <TD style={{ textAlign: 'center', fontWeight: 700, color: '#1D4ED8' }}>{row.vgs_1er || '—'}</TD>
                        <TD style={{ textAlign: 'center', fontWeight: 700, color: '#1D4ED8' }}>{row.vgs_2e || '—'}</TD>
                        <TD style={{ textAlign: 'center', fontWeight: 800, color: '#1E3A8A', fontSize: '13px' }}>{fmt(row.total)}</TD>
                        <TD style={{ textAlign: 'center', fontWeight: 700, color: '#1E40AF' }}>{fmt(row.volume)}</TD>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#1a2332' }}>
                      <td colSpan={3} style={{ padding: '8px 9px', color: 'white', fontWeight: 700, fontSize: '11px' }}>TOTAL PHOSPHATE</td>
                      <td style={{ padding: '8px 9px', textAlign: 'center', color: '#93C5FD', fontWeight: 900 }}>{fmt(phosphateRows.reduce((s, r) => s + r.vgs_1er, 0))}</td>
                      <td style={{ padding: '8px 9px', textAlign: 'center', color: '#93C5FD', fontWeight: 900 }}>{fmt(phosphateRows.reduce((s, r) => s + r.vgs_2e, 0))}</td>
                      <td style={{ padding: '8px 9px', textAlign: 'center', color: '#60A5FA', fontWeight: 900, fontSize: '15px' }}>{fmt(totalPhos.vgs)}</td>
                      <td style={{ padding: '8px 9px', textAlign: 'center', color: '#93C5FD', fontWeight: 800 }}>{fmt(totalPhos.vol)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* STERILE */}
          {sterileRows.length > 0 && (
            <div className="bg-white rounded-2xl overflow-hidden border border-amber-100" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
              <div className="flex items-center gap-3 px-5 py-3 border-b border-amber-100" style={{ background: '#FFFBEB' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#D97706', display: 'inline-block' }} />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#D97706', textTransform: 'uppercase', letterSpacing: '1px' }}>Stérile / Décapage</span>
                <span className="ml-auto" style={{ fontSize: '11px', fontWeight: 700, color: '#B45309', background: '#FEF3C7', border: '1px solid #FDE68A', padding: '2px 10px', borderRadius: '20px' }}>
                  {fmt(totalSter.vgs)} voyages · {fmt(totalSter.vol)} m³
                </span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#D97706' }}>
                      {['Niveau / Tranchée', 'Destination', 'Distance km', 'Vgs 1er Poste', 'Vgs 2e Poste', 'Total Voyages', 'Volume m³'].map(h => <TH key={h}>{h}</TH>)}
                    </tr>
                  </thead>
                  <tbody>
                    {sterileRows.map((row, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? '#FFFBEB' : 'white' }}>
                        <TD style={{ fontWeight: 700, color: '#D97706' }}>{row.tranchee}</TD>
                        <TD>{row.dest}</TD>
                        <TD style={{ textAlign: 'center', fontFamily: 'monospace' }}>{fmtDec(row.km)}</TD>
                        <TD style={{ textAlign: 'center', fontWeight: 700, color: '#D97706' }}>{row.vgs_1er || '—'}</TD>
                        <TD style={{ textAlign: 'center', fontWeight: 700, color: '#D97706' }}>{row.vgs_2e || '—'}</TD>
                        <TD style={{ textAlign: 'center', fontWeight: 800, color: '#92400E', fontSize: '13px' }}>{fmt(row.total)}</TD>
                        <TD style={{ textAlign: 'center', fontWeight: 700, color: '#B45309' }}>{fmt(row.volume)}</TD>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#1a2332' }}>
                      <td colSpan={3} style={{ padding: '8px 9px', color: 'white', fontWeight: 700, fontSize: '11px' }}>TOTAL STÉRILE</td>
                      <td style={{ padding: '8px 9px', textAlign: 'center', color: '#FDE68A', fontWeight: 900 }}>{fmt(sterileRows.reduce((s, r) => s + r.vgs_1er, 0))}</td>
                      <td style={{ padding: '8px 9px', textAlign: 'center', color: '#FDE68A', fontWeight: 900 }}>{fmt(sterileRows.reduce((s, r) => s + r.vgs_2e, 0))}</td>
                      <td style={{ padding: '8px 9px', textAlign: 'center', color: '#FDE68A', fontWeight: 900, fontSize: '15px' }}>{fmt(totalSter.vgs)}</td>
                      <td style={{ padding: '8px 9px', textAlign: 'center', color: '#FDE68A', fontWeight: 800 }}>{fmt(totalSter.vol)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {phosphateRows.length === 0 && sterileRows.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <div className="text-4xl mb-3">📋</div>
              <div className="font-semibold text-gray-500">Aucune rotation pour cette date</div>
              <div className="text-sm text-gray-400 mt-1">Saisissez les données dans "Rotation Chauffeurs"</div>
            </div>
          )}

          {/* REMARQUES */}
          <div className="bg-white rounded-2xl border border-amber-200 overflow-hidden" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
            <div className="px-5 py-3 border-b border-amber-100" style={{ background: '#FFFBEB' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📝 Remarques de la journée</span>
            </div>
            <div className="p-4 space-y-2">
              {rotations.filter(r => r.commentaires).map((r, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <span className="font-bold text-amber-700 shrink-0 bg-amber-100 px-2 py-0.5 rounded">{r.camion_id}</span>
                  <span className="text-gray-700">{r.commentaires}</span>
                </div>
              ))}
              {rotations.filter(r => r.commentaires).length === 0 && <p className="text-sm text-gray-400 italic">Aucune remarque</p>}
            </div>
          </div>

          {/* PARC ENGINS + GASOIL */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
              <div className="px-5 py-3 border-b border-gray-100" style={{ background: '#F8FAFC' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🚛 État Parc Engins</span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#374151' }}>
                    {['Type', 'Total Parc', 'Parc Dispo'].map(h => <TH key={h} style={{ textAlign: h === 'Type' ? 'left' : 'center' }}>{h}</TH>)}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { t: 'Camion 90T SITRAK', total: 4, dispo: 0 },
                    { t: 'Camion 50T MAN', total: 26, dispo: rotations.length },
                    { t: 'Pelle', total: 4, dispo: 4 },
                    { t: 'Chargeuse', total: 2, dispo: 2 },
                    { t: 'Niveleuse', total: 2, dispo: 2 },
                    { t: 'Arroseur', total: 2, dispo: 1 },
                  ].map((row, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#F9FAFB' : 'white' }}>
                      <TD>{row.t}</TD>
                      <TD style={{ textAlign: 'center', fontWeight: 700 }}>{row.total}</TD>
                      <TD style={{ textAlign: 'center', fontWeight: 700, color: row.dispo < row.total ? '#DC2626' : '#16A34A' }}>{row.dispo}</TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
              <div className="px-5 py-3 border-b border-gray-100" style={{ background: '#F8FAFC' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>⛽ Consommation Gasoil</span>
              </div>
              <div className="p-5 space-y-4">
                {[
                  { l: 'Camions', v: fmt(rotations.length * 165), c: '#1D4ED8' },
                  { l: 'Engins', v: fmt(800), c: '#D97706' },
                  { l: 'Total', v: fmt(rotations.length * 165 + 800), c: '#16A34A' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm font-semibold text-gray-600">{item.l}</span>
                    <span className="text-xl font-black" style={{ color: item.c }}>{item.v} <span className="text-sm">L</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TABLEAU ROTATIONS CHAUFFEURS */}
          {rotations.length > 0 && (
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
              <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100" style={{ background: '#F8FAFC' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Rapport de Rotation des Chauffeurs — {fmtDateFR(date)}
                </span>
                <span className="ml-auto text-xs text-gray-400">{rotations.length} camion(s)</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead>
                    <tr style={{ background: '#0D2B4E' }}>
                      <TH>Camion</TH>
                      <TH>Chauffeur 1er</TH>
                      <TH>Chauffeur 2e</TH>
                      <TH style={{ background: '#1A1500', borderLeft: '3px solid #D97706' }}>Stérile P1 · Panneau</TH>
                      <TH style={{ background: '#1A1500' }}>km</TH>
                      <TH style={{ background: '#1A1500' }}>Vgs</TH>
                      <TH style={{ background: '#080F1E', borderLeft: '3px solid #1D4ED8' }}>Phosphate P1 · Panneau</TH>
                      <TH style={{ background: '#080F1E' }}>km</TH>
                      <TH style={{ background: '#080F1E' }}>Vgs</TH>
                      <TH style={{ background: '#1A0800', borderLeft: '3px solid #B45309' }}>Stérile P2 · Panneau</TH>
                      <TH style={{ background: '#1A0800' }}>km</TH>
                      <TH style={{ background: '#1A0800' }}>Vgs</TH>
                      <TH style={{ background: '#06060F', borderLeft: '3px solid #1E40AF' }}>Phosphate P2 · Panneau</TH>
                      <TH style={{ background: '#06060F' }}>km</TH>
                      <TH style={{ background: '#06060F' }}>Vgs</TH>
                      <TH>Commentaires</TH>
                    </tr>
                  </thead>
                  <tbody>
                    {rotations.map((r, i) => (
                      <tr key={r.id} style={{ background: i % 2 === 0 ? '#F8FAFC' : 'white' }}>
                        <TD style={{ fontWeight: 800, color: '#004B8D' }}>{r.camion_id}</TD>
                        <TD>{r.chauffeur_1er || '—'}</TD>
                        <TD style={{ borderRight: '2px solid #CBD5E1' }}>{r.chauffeur_2e || '—'}</TD>
                        <TD style={{ background: '#FFFBEB', borderLeft: '3px solid #D97706', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {[r.sterile_p1a_panneau, r.sterile_p1b_panneau].filter(Boolean).join(' / ') || '—'}
                        </TD>
                        <TD style={{ background: '#FFFBEB', textAlign: 'center', fontFamily: 'monospace', fontSize: '10px' }}>
                          {[r.sterile_p1a_km, r.sterile_p1b_km].filter(v => v != null).map(v => fmtDec(v)).join('/') || '—'}
                        </TD>
                        <TD style={{ background: '#FFFBEB', textAlign: 'center', fontWeight: 700, color: '#D97706' }}>
                          {((r.sterile_p1a_vgs || 0) + (r.sterile_p1b_vgs || 0)) || '—'}
                        </TD>
                        <TD style={{ background: '#EFF6FF', borderLeft: '3px solid #1D4ED8', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {[r.phosphate_p1a_panneau, r.phosphate_p1b_panneau].filter(Boolean).join(' / ') || '—'}
                        </TD>
                        <TD style={{ background: '#EFF6FF', textAlign: 'center', fontFamily: 'monospace', fontSize: '10px' }}>
                          {[r.phosphate_p1a_km, r.phosphate_p1b_km].filter(v => v != null).map(v => fmtDec(v)).join('/') || '—'}
                        </TD>
                        <TD style={{ background: '#EFF6FF', textAlign: 'center', fontWeight: 700, color: '#1D4ED8' }}>
                          {((r.phosphate_p1a_vgs || 0) + (r.phosphate_p1b_vgs || 0)) || '—'}
                        </TD>
                        <TD style={{ background: '#FEF9EC', borderLeft: '3px solid #B45309', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {[r.sterile_p2a_panneau, r.sterile_p2b_panneau].filter(Boolean).join(' / ') || '—'}
                        </TD>
                        <TD style={{ background: '#FEF9EC', textAlign: 'center', fontFamily: 'monospace', fontSize: '10px' }}>
                          {[r.sterile_p2a_km, r.sterile_p2b_km].filter(v => v != null).map(v => fmtDec(v)).join('/') || '—'}
                        </TD>
                        <TD style={{ background: '#FEF9EC', textAlign: 'center', fontWeight: 700, color: '#B45309' }}>
                          {((r.sterile_p2a_vgs || 0) + (r.sterile_p2b_vgs || 0)) || '—'}
                        </TD>
                        <TD style={{ background: '#EEF2FF', borderLeft: '3px solid #1E40AF', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {[r.phosphate_p2a_panneau, r.phosphate_p2b_panneau].filter(Boolean).join(' / ') || '—'}
                        </TD>
                        <TD style={{ background: '#EEF2FF', textAlign: 'center', fontFamily: 'monospace', fontSize: '10px' }}>
                          {[r.phosphate_p2a_km, r.phosphate_p2b_km].filter(v => v != null).map(v => fmtDec(v)).join('/') || '—'}
                        </TD>
                        <TD style={{ background: '#EEF2FF', textAlign: 'center', fontWeight: 700, color: '#1E40AF' }}>
                          {((r.phosphate_p2a_vgs || 0) + (r.phosphate_p2b_vgs || 0)) || '—'}
                        </TD>
                        <TD style={{ color: '#6B7280', fontStyle: r.commentaires ? 'normal' : 'italic', maxWidth: 180 }}>
                          {r.commentaires || '—'}
                        </TD>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#1a2332' }}>
                      <td colSpan={3} style={{ padding: '8px 9px', color: 'white', fontWeight: 700, fontSize: '12px' }}>
                        TOTAL — {rotations.length} camion(s)
                      </td>
                      <td colSpan={2} style={{ padding: '8px 9px', background: '#1A1500', borderLeft: '3px solid #D97706' }} />
                      <td style={{ padding: '8px 9px', background: '#1A1500', textAlign: 'center', color: '#FDE68A', fontWeight: 900, fontSize: '13px' }}>
                        {fmt(rotations.reduce((s, r) => s + (r.sterile_p1a_vgs || 0) + (r.sterile_p1b_vgs || 0), 0))}
                      </td>
                      <td colSpan={2} style={{ padding: '8px 9px', background: '#080F1E', borderLeft: '3px solid #1D4ED8' }} />
                      <td style={{ padding: '8px 9px', background: '#080F1E', textAlign: 'center', color: '#93C5FD', fontWeight: 900, fontSize: '13px' }}>
                        {fmt(rotations.reduce((s, r) => s + (r.phosphate_p1a_vgs || 0) + (r.phosphate_p1b_vgs || 0), 0))}
                      </td>
                      <td colSpan={2} style={{ padding: '8px 9px', background: '#1A0800', borderLeft: '3px solid #B45309' }} />
                      <td style={{ padding: '8px 9px', background: '#1A0800', textAlign: 'center', color: '#FCA5A5', fontWeight: 900, fontSize: '13px' }}>
                        {fmt(rotations.reduce((s, r) => s + (r.sterile_p2a_vgs || 0) + (r.sterile_p2b_vgs || 0), 0))}
                      </td>
                      <td colSpan={2} style={{ padding: '8px 9px', background: '#06060F', borderLeft: '3px solid #1E40AF' }} />
                      <td style={{ padding: '8px 9px', background: '#06060F', textAlign: 'center', color: '#A5B4FC', fontWeight: 900, fontSize: '13px' }}>
                        {fmt(rotations.reduce((s, r) => s + (r.phosphate_p2a_vgs || 0) + (r.phosphate_p2b_vgs || 0), 0))}
                      </td>
                      <td style={{ padding: '8px 9px' }} />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════
// RAPPORT HEBDOMADAIRE
// ══════════════════════════════════════════════════
function RapportHebdomadaire() {
  const getWeekRange = () => {
    const now = new Date();
    const day = now.getDay();
    const mon = new Date(now);
    mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    return { from: mon.toISOString().slice(0, 10), to: sun.toISOString().slice(0, 10) };
  };

  const [range, setRange] = useState(getWeekRange);
  const [rotations, setRotations] = useState([]);
  const [arrets, setArrets] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const dates = [];
      const d = new Date(range.from);
      const end = new Date(range.to);
      while (d <= end) { dates.push(d.toISOString().slice(0, 10)); d.setDate(d.getDate() + 1); }
      const results = await Promise.all(dates.map(dt => rotationAPI.getByDate(dt)));
      const allRots = results.flatMap((r, i) => (r.data.rotations || []).map(rot => ({ ...rot, _date: dates[i] })));
      setRotations(allRots);
      const arr = await arretAPI.getAll({ from: range.from, to: range.to });
      setArrets(arr.data.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [range.from, range.to]);

  const byDate = {};
  rotations.forEach(r => {
    const d = r._date || r.date?.slice(0, 10);
    if (d) { if (!byDate[d]) byDate[d] = []; byDate[d].push(r); }
  });
  const dates = Object.keys(byDate).sort();
  const totalGlobal = calcFromRotations(rotations);
  const allPanneaux = getPanneauRows(rotations);

  const byDest = {};
  allPanneaux.forEach(r => {
    const k = `${r.type}||${r.tranchee}||${r.dest}`;
    if (!byDest[k]) byDest[k] = { type: r.type, tranchee: r.tranchee, dest: r.dest, total: 0, volume: 0 };
    byDest[k].total += r.total; byDest[k].volume += r.volume;
  });
  const destRows = Object.values(byDest).sort((a, b) => b.total - a.total);

  const arretsByType = {};
  arrets.forEach(a => {
    if (!arretsByType[a.type_arret]) arretsByType[a.type_arret] = { nb: 0, heures: 0 };
    arretsByType[a.type_arret].nb++;
    arretsByType[a.type_arret].heures += parseFloat(a.duree_heures) || 0;
  });

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-4 border border-gray-100 flex flex-wrap items-center gap-4 justify-between" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
        <div>
          <h2 className="text-base font-bold text-gray-800">Rapport Hebdomadaire de Production</h2>
          <p className="text-xs text-gray-400">Site Minier BenGuerir — OCP Group</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-gray-500">Du</span>
          <input type="date" value={range.from} onChange={e => setRange(r => ({ ...r, from: e.target.value }))}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <span className="text-xs font-semibold text-gray-500">Au</span>
          <input type="date" value={range.to} onChange={e => setRange(r => ({ ...r, to: e.target.value }))}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#004B8D,#0066CC)' }}>
            🖨 Imprimer
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg,#0A1628,#004B8D,#00843D)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
            <div className="px-6 py-5">
              <h1 className="text-xl font-black text-white">Rapport Hebdomadaire de Production</h1>
              <p className="text-white/70 text-sm mt-0.5">Site de Benguerir — {fmtDateShort(range.from)} → {fmtDateShort(range.to)}</p>
              <div className="grid grid-cols-4 gap-3 mt-4">
                {[
                  { l: 'Jours de production', v: dates.length, c: '#6EE7B7' },
                  { l: 'Total Voyages', v: fmt(totalGlobal.total_voyages), c: '#93C5FD' },
                  { l: 'Volume Phosphate', v: `${fmt(totalGlobal.volume_phosphate)} m³`, c: '#60A5FA' },
                  { l: 'Volume Stérile', v: `${fmt(totalGlobal.volume_sterile)} m³`, c: '#FDE68A' },
                ].map((k, i) => (
                  <div key={i} className="bg-white/10 rounded-xl p-3 border border-white/20 text-center">
                    <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: k.c + 'AA' }}>{k.l}</div>
                    <div style={{ fontSize: '22px', fontWeight: 900, color: k.c, marginTop: '4px' }}>{k.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TABLEAU JOURNALIER */}
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
            <div className="px-5 py-3 border-b border-gray-100" style={{ background: '#F8FAFC' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📅 Récapitulatif Journalier</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#0D2B4E' }}>
                    <TH>Date</TH>
                    <TH>Jour</TH>
                    <TH style={{ textAlign: 'center', background: '#1D4ED8', borderLeft: '3px solid #3B82F6' }}>Vgs Phosphate</TH>
                    <TH style={{ textAlign: 'center', background: '#1D4ED8' }}>Vol. Phosphate m³</TH>
                    <TH style={{ textAlign: 'center', background: '#D97706', borderLeft: '3px solid #F59E0B' }}>Vgs Stérile</TH>
                    <TH style={{ textAlign: 'center', background: '#D97706' }}>Vol. Stérile m³</TH>
                    <TH style={{ textAlign: 'center' }}>Total Voyages</TH>
                    <TH style={{ textAlign: 'center' }}>Total Volume m³</TH>
                    <TH style={{ textAlign: 'center' }}>Nb Camions</TH>
                    <TH style={{ textAlign: 'center' }}>Arrêts</TH>
                  </tr>
                </thead>
                <tbody>
                  {dates.map((d, i) => {
                    const rots = byDate[d] || [];
                    const c = calcFromRotations(rots);
                    const dayArrets = arrets.filter(a => a.date?.slice(0, 10) === d);
                    const arretTotal = dayArrets.some(a => a.arret_total);
                    const dayObj = new Date(d + 'T12:00:00');
                    const isWeekend = dayObj.getDay() === 0 || dayObj.getDay() === 6;
                    const dayName = dayObj.toLocaleDateString('fr-FR', { weekday: 'long' });
                    return (
                      <tr key={d} style={{ background: arretTotal ? '#FEF2F2' : isWeekend ? '#F0FDF4' : i % 2 === 0 ? '#F8FAFC' : 'white' }}>
                        <TD style={{ fontWeight: 700, color: '#004B8D' }}>{d}</TD>
                        <TD style={{ textTransform: 'capitalize', color: isWeekend ? '#16A34A' : '#374151', fontWeight: isWeekend ? 600 : 400 }}>{dayName}</TD>
                        <TD style={{ textAlign: 'center', fontWeight: 700, color: '#1D4ED8', background: '#EFF6FF', borderLeft: '3px solid #3B82F6' }}>{c.voyages_phosphate || '—'}</TD>
                        <TD style={{ textAlign: 'center', color: '#1D4ED8', background: '#EFF6FF' }}>{c.volume_phosphate ? fmt(c.volume_phosphate) : '—'}</TD>
                        <TD style={{ textAlign: 'center', fontWeight: 700, color: '#D97706', background: '#FFFBEB', borderLeft: '3px solid #F59E0B' }}>{c.voyages_sterile || '—'}</TD>
                        <TD style={{ textAlign: 'center', color: '#D97706', background: '#FFFBEB' }}>{c.volume_sterile ? fmt(c.volume_sterile) : '—'}</TD>
                        <TD style={{ textAlign: 'center', fontWeight: 800, fontSize: '13px' }}>{c.total_voyages || '—'}</TD>
                        <TD style={{ textAlign: 'center', fontWeight: 700 }}>{c.total_volume ? fmt(c.total_volume) : '—'}</TD>
                        <TD style={{ textAlign: 'center' }}>{rots.length}</TD>
                        <TD style={{ textAlign: 'center' }}>
                          {dayArrets.length > 0 ? (
                            <span style={{ fontSize: '10px', fontWeight: 700, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', padding: '2px 6px', borderRadius: '20px' }}>
                              {dayArrets.length} ({fmtDec(dayArrets.reduce((s, a) => s + (parseFloat(a.duree_heures) || 0), 0))}h)
                            </span>
                          ) : <span style={{ color: '#D1D5DB', fontSize: '11px' }}>—</span>}
                        </TD>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ background: '#1a2332' }}>
                    <td colSpan={2} style={{ padding: '9px', color: 'white', fontWeight: 700 }}>TOTAL SEMAINE</td>
                    <td style={{ padding: '9px', textAlign: 'center', color: '#93C5FD', fontWeight: 900, background: '#080F1E', borderLeft: '3px solid #3B82F6' }}>{fmt(totalGlobal.voyages_phosphate)}</td>
                    <td style={{ padding: '9px', textAlign: 'center', color: '#93C5FD', background: '#080F1E' }}>{fmt(totalGlobal.volume_phosphate)}</td>
                    <td style={{ padding: '9px', textAlign: 'center', color: '#FDE68A', fontWeight: 900, background: '#1A1500', borderLeft: '3px solid #F59E0B' }}>{fmt(totalGlobal.voyages_sterile)}</td>
                    <td style={{ padding: '9px', textAlign: 'center', color: '#FDE68A', background: '#1A1500' }}>{fmt(totalGlobal.volume_sterile)}</td>
                    <td style={{ padding: '9px', textAlign: 'center', color: '#6EE7B7', fontWeight: 900, fontSize: '15px' }}>{fmt(totalGlobal.total_voyages)}</td>
                    <td style={{ padding: '9px', textAlign: 'center', color: '#6EE7B7', fontWeight: 900 }}>{fmt(totalGlobal.total_volume)}</td>
                    <td colSpan={2} style={{ padding: '9px' }} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* PAR DESTINATION */}
          {destRows.length > 0 && (
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
              <div className="px-5 py-3 border-b border-gray-100" style={{ background: '#F8FAFC' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📍 Production par Tranchée / Destination</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#374151' }}>
                      {['Type', 'Tranchée / Source', 'Destination', 'Total Voyages', 'Volume m³', '% du total'].map(h => <TH key={h}>{h}</TH>)}
                    </tr>
                  </thead>
                  <tbody>
                    {destRows.map((row, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? '#F9FAFB' : 'white' }}>
                        <TD>
                          <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '99px', background: row.type === 'PHOSPHATE' ? '#DBEAFE' : '#FEF3C7', color: row.type === 'PHOSPHATE' ? '#1D4ED8' : '#B45309' }}>{row.type}</span>
                        </TD>
                        <TD style={{ fontWeight: 600 }}>{row.tranchee}</TD>
                        <TD>{row.dest}</TD>
                        <TD style={{ textAlign: 'center', fontWeight: 800 }}>{fmt(row.total)}</TD>
                        <TD style={{ textAlign: 'center', fontWeight: 700 }}>{fmt(row.volume)}</TD>
                        <TD>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1, background: '#E5E7EB', borderRadius: 99, height: 6 }}>
                              <div style={{ height: 6, borderRadius: 99, width: `${Math.min(100, (row.total / (totalGlobal.total_voyages || 1)) * 100)}%`, background: row.type === 'PHOSPHATE' ? '#1D4ED8' : '#D97706' }} />
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', minWidth: 36 }}>
                              {((row.total / (totalGlobal.total_voyages || 1)) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </TD>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ARRÊTS */}
          {arrets.length > 0 && (
            <div className="bg-white rounded-2xl overflow-hidden border border-red-100" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
              <div className="px-5 py-3 border-b border-red-100" style={{ background: '#FFF5F5' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#B91C1C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>⚠️ Arrêts de la Semaine</span>
                <span style={{ marginLeft: 12, fontSize: '11px', fontWeight: 700, color: '#DC2626', background: '#FEE2E2', border: '1px solid #FECACA', padding: '2px 8px', borderRadius: '20px' }}>
                  {arrets.length} incident(s) · {fmtDec(arrets.reduce((s, a) => s + (parseFloat(a.duree_heures) || 0), 0))}h
                </span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#B91C1C' }}>
                      {['Date', 'Engin', "Type d'arrêt", 'Durée (h)', 'Description', 'Arrêt Total ?'].map(h => <TH key={h}>{h}</TH>)}
                    </tr>
                  </thead>
                  <tbody>
                    {arrets.map((a, i) => (
                      <tr key={a.id} style={{ background: a.arret_total ? '#FEF2F2' : i % 2 === 0 ? '#FFF8F8' : 'white' }}>
                        <TD style={{ fontWeight: 700 }}>{a.date?.slice(0, 10)}</TD>
                        <TD style={{ fontWeight: 600, color: '#374151' }}>{a.engin_code || <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>Global</span>}</TD>
                        <TD>{a.type_arret}</TD>
                        <TD style={{ textAlign: 'center', fontWeight: 700, color: '#DC2626' }}>{fmtDec(a.duree_heures)}h</TD>
                        <TD style={{ color: '#6B7280', maxWidth: 240 }}>{a.description || '—'}</TD>
                        <TD style={{ textAlign: 'center' }}>
                          {a.arret_total ? <span style={{ fontSize: '10px', fontWeight: 700, color: '#DC2626', background: '#FEE2E2', padding: '2px 7px', borderRadius: '20px' }}>OUI</span>
                            : <span style={{ color: '#D1D5DB' }}>—</span>}
                        </TD>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#1a2332' }}>
                      <td colSpan={3} style={{ padding: '8px 9px', color: 'white', fontWeight: 700 }}>TOTAL</td>
                      <td style={{ padding: '8px 9px', textAlign: 'center', color: '#FCA5A5', fontWeight: 900 }}>
                        {fmtDec(arrets.reduce((s, a) => s + (parseFloat(a.duree_heures) || 0), 0))}h
                      </td>
                      <td colSpan={2} style={{ padding: '8px 9px' }} />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {dates.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <div className="text-4xl mb-3">📅</div>
              <div className="font-semibold text-gray-500">Aucune donnée pour cette période</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════
// RAPPORT MENSUEL
// ══════════════════════════════════════════════════
function RapportMensuel() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(String(today.getFullYear()));
  const [viewMonth, setViewMonth] = useState(String(today.getMonth() + 1).padStart(2, '0'));
  const [rotations, setRotations] = useState([]);
  const [arrets, setArrets] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async (y, m) => {
    setLoading(true);
    const { from, to } = ocpMonthRange(y, m);
    try {
      const dates = [];
      const d = new Date(from); const end = new Date(to);
      while (d <= end) { dates.push(d.toISOString().slice(0, 10)); d.setDate(d.getDate() + 1); }
      const results = await Promise.all(dates.map(dt => rotationAPI.getByDate(dt)));
      const allRots = results.flatMap((r, i) => (r.data.rotations || []).map(rot => ({ ...rot, _date: dates[i] })));
      setRotations(allRots);
      const arr = await arretAPI.getAll({ from, to });
      setArrets(arr.data.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(viewYear, viewMonth); }, [viewYear, viewMonth]);

  const { from, to } = ocpMonthRange(viewYear, viewMonth);

  const byDate = {};
  rotations.forEach(r => {
    const d = r._date || r.date?.slice(0, 10);
    if (d) { if (!byDate[d]) byDate[d] = []; byDate[d].push(r); }
  });
  const dates = Object.keys(byDate).sort();
  const totalGlobal = calcFromRotations(rotations);
  const dateTrancheeMap = getDateTrancheeMap(rotations);

  const allPanneaux = getPanneauRows(rotations);
  const trancheeRows = [];
  const seenKeys = new Set();
  allPanneaux.forEach(r => {
    const k = `${r.type}||${r.tranchee}||${r.dest}`;
    if (!seenKeys.has(k)) {
      seenKeys.add(k);
      const total = Object.values(dateTrancheeMap[k] || {}).reduce((s, v) => s + v, 0);
      trancheeRows.push({ type: r.type, tranchee: r.tranchee, dest: r.dest, key: k, total, volume: total * (r.type === 'PHOSPHATE' ? 16 : 14) });
    }
  });
  trancheeRows.sort((a, b) => { if (a.type !== b.type) return a.type === 'PHOSPHATE' ? -1 : 1; return b.total - a.total; });

  const phosphateTranchees = trancheeRows.filter(r => r.type === 'PHOSPHATE');
  const sterileTranchees = trancheeRows.filter(r => r.type === 'STERILE');

  // Semaines pour récap
  const weeks = [];
  let wCur = [];
  dates.forEach((d, i) => {
    wCur.push(d);
    if (wCur.length === 7 || i === dates.length - 1) { weeks.push([...wCur]); wCur = []; }
  });

  const thSmall = { padding: '6px 7px', fontSize: '9px', fontWeight: 700, color: 'white', whiteSpace: 'nowrap', textAlign: 'center' };
  const tdSmall = { padding: '5px 7px', fontSize: '10px', borderBottom: '1px solid #F1F5F9', textAlign: 'center', whiteSpace: 'nowrap' };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-4 border border-gray-100 flex flex-wrap items-center gap-4 justify-between" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
        <div>
          <h2 className="text-base font-bold text-gray-800">Rapport Mensuel de Production</h2>
          <p className="text-xs text-gray-400">Cycle OCP : du 27 mois précédent au 26 mois courant</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={viewMonth} onChange={e => setViewMonth(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400">
            {MONTH_NAMES.map((n, i) => <option key={i} value={String(i + 1).padStart(2, '0')}>{n}</option>)}
          </select>
          <select value={viewYear} onChange={e => setViewYear(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400">
            {[2025, 2026, 2027].map(y => <option key={y}>{y}</option>)}
          </select>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#004B8D,#0066CC)' }}>
            🖨 Imprimer
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-4">
          {/* HEADER */}
          <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg,#0A1628,#004B8D,#00843D)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
            <div className="px-6 py-5">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-black text-white">Rapport Mensuel de Production</h1>
                  <p className="text-white/70 text-sm mt-1">Site de Benguerir — {MONTH_NAMES[parseInt(viewMonth) - 1]} {viewYear}</p>
                  <p className="text-white/40 text-xs mt-0.5">Période OCP : {from} → {to}</p>
                </div>
                <div className="bg-white/15 border border-white/30 rounded-xl px-6 py-4 text-right">
                  <div className="text-white/60 text-xs uppercase tracking-wider">Volume Total</div>
                  <div className="text-4xl font-black text-white">{fmt(totalGlobal.total_volume)}</div>
                  <div className="text-white/60 text-sm">m³</div>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-3 mt-5">
                {[
                  { l: 'Jours Production', v: dates.length, c: '#6EE7B7' },
                  { l: 'Vgs Phosphate', v: fmt(totalGlobal.voyages_phosphate), c: '#93C5FD' },
                  { l: 'Vol. Phosphate', v: `${fmt(totalGlobal.volume_phosphate)} m³`, c: '#60A5FA' },
                  { l: 'Vgs Stérile', v: fmt(totalGlobal.voyages_sterile), c: '#FDE68A' },
                  { l: 'Vol. Stérile', v: `${fmt(totalGlobal.volume_sterile)} m³`, c: '#FBBF24' },
                ].map((k, i) => (
                  <div key={i} className="bg-white/10 rounded-xl p-3 border border-white/20 text-center">
                    <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: k.c + 'AA' }}>{k.l}</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: k.c, marginTop: '4px' }}>{k.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TABLEAU CROISÉ PHOSPHATE */}
          {phosphateTranchees.length > 0 && (
            <div className="bg-white rounded-2xl overflow-hidden border border-blue-100" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
              <div className="flex items-center gap-3 px-5 py-3 border-b border-blue-100" style={{ background: '#F0F6FF' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#1D4ED8', display: 'inline-block' }} />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Phosphate — Voyages Journaliers par Tranchée
                </span>
                <span className="ml-auto" style={{ fontSize: '11px', fontWeight: 700, color: '#1D4ED8', background: '#DBEAFE', border: '1px solid #BFDBFE', padding: '2px 10px', borderRadius: '20px' }}>
                  Total : {fmt(totalGlobal.voyages_phosphate)} vgs · {fmt(totalGlobal.volume_phosphate)} m³
                </span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#1D4ED8' }}>
                      <th style={{ ...thSmall, textAlign: 'left', minWidth: 110, position: 'sticky', left: 0, background: '#1D4ED8' }}>Tranchée</th>
                      <th style={{ ...thSmall, textAlign: 'left', minWidth: 130 }}>Destination</th>
                      {dates.map(d => <th key={d} style={{ ...thSmall, minWidth: 40 }}>{fmtDateShort(d)}</th>)}
                      <th style={{ ...thSmall, minWidth: 65, background: '#1E3A8A' }}>TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {phosphateTranchees.map((row, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? '#EFF6FF' : 'white' }}>
                        <td style={{ ...tdSmall, textAlign: 'left', fontWeight: 700, color: '#1D4ED8', position: 'sticky', left: 0, background: i % 2 === 0 ? '#EFF6FF' : 'white' }}>{row.tranchee}</td>
                        <td style={{ ...tdSmall, textAlign: 'left', fontSize: '10px', color: '#374151' }}>{row.dest}</td>
                        {dates.map(d => {
                          const v = dateTrancheeMap[row.key]?.[d];
                          return <td key={d} style={{ ...tdSmall, fontWeight: v ? 700 : 400, color: v ? '#1D4ED8' : '#D1D5DB' }}>{v || '—'}</td>;
                        })}
                        <td style={{ ...tdSmall, fontWeight: 900, color: '#1D4ED8', fontSize: '12px', background: '#DBEAFE' }}>{fmt(row.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#1E3A8A' }}>
                      <td colSpan={2} style={{ padding: '7px 9px', color: 'white', fontWeight: 700, fontSize: '11px' }}>TOTAL PHOSPHATE</td>
                      {dates.map(d => {
                        const v = Object.entries(dateTrancheeMap).filter(([k]) => k.startsWith('PHOSPHATE')).reduce((s, [, dm]) => s + (dm[d] || 0), 0);
                        return <td key={d} style={{ ...tdSmall, color: '#93C5FD', fontWeight: 800 }}>{v || '—'}</td>;
                      })}
                      <td style={{ ...tdSmall, color: '#60A5FA', fontWeight: 900, fontSize: '14px', background: '#1E3A8A' }}>{fmt(totalGlobal.voyages_phosphate)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* TABLEAU CROISÉ STERILE */}
          {sterileTranchees.length > 0 && (
            <div className="bg-white rounded-2xl overflow-hidden border border-amber-100" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
              <div className="flex items-center gap-3 px-5 py-3 border-b border-amber-100" style={{ background: '#FFFBEB' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#D97706', display: 'inline-block' }} />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#D97706', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Stérile — Voyages Journaliers par Tranchée
                </span>
                <span className="ml-auto" style={{ fontSize: '11px', fontWeight: 700, color: '#B45309', background: '#FEF3C7', border: '1px solid #FDE68A', padding: '2px 10px', borderRadius: '20px' }}>
                  Total : {fmt(totalGlobal.voyages_sterile)} vgs · {fmt(totalGlobal.volume_sterile)} m³
                </span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#D97706' }}>
                      <th style={{ ...thSmall, textAlign: 'left', minWidth: 110, position: 'sticky', left: 0, background: '#D97706' }}>Tranchée</th>
                      <th style={{ ...thSmall, textAlign: 'left', minWidth: 130 }}>Destination</th>
                      {dates.map(d => <th key={d} style={{ ...thSmall, minWidth: 40 }}>{fmtDateShort(d)}</th>)}
                      <th style={{ ...thSmall, minWidth: 65, background: '#92400E' }}>TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sterileTranchees.map((row, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? '#FFFBEB' : 'white' }}>
                        <td style={{ ...tdSmall, textAlign: 'left', fontWeight: 700, color: '#D97706', position: 'sticky', left: 0, background: i % 2 === 0 ? '#FFFBEB' : 'white' }}>{row.tranchee}</td>
                        <td style={{ ...tdSmall, textAlign: 'left', fontSize: '10px', color: '#374151' }}>{row.dest}</td>
                        {dates.map(d => {
                          const v = dateTrancheeMap[row.key]?.[d];
                          return <td key={d} style={{ ...tdSmall, fontWeight: v ? 700 : 400, color: v ? '#D97706' : '#D1D5DB' }}>{v || '—'}</td>;
                        })}
                        <td style={{ ...tdSmall, fontWeight: 900, color: '#D97706', fontSize: '12px', background: '#FEF3C7' }}>{fmt(row.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#92400E' }}>
                      <td colSpan={2} style={{ padding: '7px 9px', color: 'white', fontWeight: 700, fontSize: '11px' }}>TOTAL STÉRILE</td>
                      {dates.map(d => {
                        const v = Object.entries(dateTrancheeMap).filter(([k]) => k.startsWith('STERILE')).reduce((s, [, dm]) => s + (dm[d] || 0), 0);
                        return <td key={d} style={{ ...tdSmall, color: '#FDE68A', fontWeight: 800 }}>{v || '—'}</td>;
                      })}
                      <td style={{ ...tdSmall, color: '#FDE68A', fontWeight: 900, fontSize: '14px', background: '#92400E' }}>{fmt(totalGlobal.voyages_sterile)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* RÉCAP PAR SEMAINE */}
          {weeks.length > 0 && (
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
              <div className="px-5 py-3 border-b border-gray-100" style={{ background: '#F8FAFC' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📅 Récapitulatif Hebdomadaire</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#374151' }}>
                      <TH>Semaine</TH>
                      <TH>Période</TH>
                      <TH style={{ textAlign: 'center', background: '#1D4ED8', borderLeft: '3px solid #3B82F6' }}>Vgs Phosphate</TH>
                      <TH style={{ textAlign: 'center', background: '#1D4ED8' }}>Vol. Phosphate m³</TH>
                      <TH style={{ textAlign: 'center', background: '#D97706', borderLeft: '3px solid #F59E0B' }}>Vgs Stérile</TH>
                      <TH style={{ textAlign: 'center', background: '#D97706' }}>Vol. Stérile m³</TH>
                      <TH style={{ textAlign: 'center' }}>Total Voyages</TH>
                      <TH style={{ textAlign: 'center' }}>Total Volume m³</TH>
                      <TH style={{ textAlign: 'center' }}>Nb Jours</TH>
                    </tr>
                  </thead>
                  <tbody>
                    {weeks.map((wDates, wi) => {
                      const wRots = wDates.flatMap(d => byDate[d] || []);
                      const wc = calcFromRotations(wRots);
                      return (
                        <tr key={wi} style={{ background: wi % 2 === 0 ? '#F9FAFB' : 'white' }}>
                          <TD style={{ fontWeight: 700, color: '#004B8D' }}>Semaine {wi + 1}</TD>
                          <TD style={{ fontSize: '10px', color: '#6B7280' }}>{fmtDateShort(wDates[0])} → {fmtDateShort(wDates[wDates.length - 1])}</TD>
                          <TD style={{ textAlign: 'center', fontWeight: 700, color: '#1D4ED8', background: '#EFF6FF', borderLeft: '3px solid #3B82F6' }}>{fmt(wc.voyages_phosphate)}</TD>
                          <TD style={{ textAlign: 'center', color: '#1D4ED8', background: '#EFF6FF' }}>{fmt(wc.volume_phosphate)}</TD>
                          <TD style={{ textAlign: 'center', fontWeight: 700, color: '#D97706', background: '#FFFBEB', borderLeft: '3px solid #F59E0B' }}>{fmt(wc.voyages_sterile)}</TD>
                          <TD style={{ textAlign: 'center', color: '#D97706', background: '#FFFBEB' }}>{fmt(wc.volume_sterile)}</TD>
                          <TD style={{ textAlign: 'center', fontWeight: 800 }}>{fmt(wc.total_voyages)}</TD>
                          <TD style={{ textAlign: 'center', fontWeight: 700 }}>{fmt(wc.total_volume)}</TD>
                          <TD style={{ textAlign: 'center' }}>{wDates.filter(d => byDate[d]?.length > 0).length}</TD>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#1a2332' }}>
                      <td colSpan={2} style={{ padding: '9px', color: 'white', fontWeight: 700 }}>TOTAL MOIS</td>
                      <td style={{ padding: '9px', textAlign: 'center', color: '#93C5FD', fontWeight: 900, background: '#080F1E', borderLeft: '3px solid #3B82F6' }}>{fmt(totalGlobal.voyages_phosphate)}</td>
                      <td style={{ padding: '9px', textAlign: 'center', color: '#93C5FD', background: '#080F1E' }}>{fmt(totalGlobal.volume_phosphate)}</td>
                      <td style={{ padding: '9px', textAlign: 'center', color: '#FDE68A', fontWeight: 900, background: '#1A1500', borderLeft: '3px solid #F59E0B' }}>{fmt(totalGlobal.voyages_sterile)}</td>
                      <td style={{ padding: '9px', textAlign: 'center', color: '#FDE68A', background: '#1A1500' }}>{fmt(totalGlobal.volume_sterile)}</td>
                      <td style={{ padding: '9px', textAlign: 'center', color: '#6EE7B7', fontWeight: 900, fontSize: '15px' }}>{fmt(totalGlobal.total_voyages)}</td>
                      <td style={{ padding: '9px', textAlign: 'center', color: '#6EE7B7', fontWeight: 900 }}>{fmt(totalGlobal.total_volume)}</td>
                      <td style={{ padding: '9px', textAlign: 'center', color: 'white', fontWeight: 700 }}>{dates.length}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {rotations.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <div className="text-5xl mb-3">📊</div>
              <div className="font-semibold text-gray-500 text-lg">Aucune donnée pour ce mois</div>
              <div className="text-sm text-gray-400 mt-1">Période : {from} → {to}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════════
export default function Rapports() {
  const [activeTab, setActiveTab] = useState('journalier');

  const tabs = [
    { id: 'journalier', icon: '📋', label: 'Rapport Journalier', desc: 'Production + rotations du jour' },
    { id: 'hebdomadaire', icon: '📅', label: 'Rapport Hebdomadaire', desc: 'Récapitulatif de la semaine' },
    { id: 'mensuel', icon: '📊', label: 'Rapport Mensuel', desc: 'Tableau croisé mensuel OCP' },
  ];

  return (
    <div className="space-y-4 max-w-full">
      <div className="flex gap-3">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex-1 p-4 rounded-2xl border-2 text-left transition-all"
            style={{
              borderColor: activeTab === tab.id ? '#004B8D' : '#E5E7EB',
              background: activeTab === tab.id ? '#EFF6FF' : 'white',
              boxShadow: activeTab === tab.id ? '0 0 0 3px rgba(0,75,141,0.1)' : '0 1px 4px rgba(0,0,0,0.04)',
            }}>
            <div style={{ fontSize: '24px', marginBottom: '6px' }}>{tab.icon}</div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: activeTab === tab.id ? '#004B8D' : '#1F2937' }}>{tab.label}</div>
            <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>{tab.desc}</div>
          </button>
        ))}
      </div>
      {activeTab === 'journalier' && <RapportJournalier />}
      {activeTab === 'hebdomadaire' && <RapportHebdomadaire />}
      {activeTab === 'mensuel' && <RapportMensuel />}
    </div>
  );
}
