const fmt = n => Number(n || 0).toLocaleString('fr-FR');

function printHTML(html, filename) {
  const win = window.open('', '_blank', 'width=1000,height=750');
  if (!win) { alert('Autoriser les popups pour exporter en PDF'); return; }
  win.document.write(html);
  win.document.close();
  win.onload = () => { setTimeout(() => win.print(), 400); };
}

const BASE_STYLES = `
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',system-ui,sans-serif;font-size:10px;color:#0f172a;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  @page{margin:14mm 12mm;size:A4}
  .page{padding:0}
  .header{display:flex;justify-content:space-between;align-items:center;padding-bottom:5mm;border-bottom:2.5px solid #004B8D;margin-bottom:6mm}
  .logo-name{font-size:20px;font-weight:900;color:#004B8D;letter-spacing:-0.5px}
  .logo-sub{font-size:8px;color:#64748B;text-transform:uppercase;letter-spacing:1.5px;margin-top:1px}
  .ocp-badge{background:#004B8D;color:white;font-size:8px;font-weight:700;padding:2px 7px;border-radius:10px;text-transform:uppercase;letter-spacing:0.5px}
  .doc-title{font-size:13px;font-weight:800;color:#0f172a;text-align:right}
  .doc-period{font-size:11px;font-weight:600;color:#00843D;text-align:right;margin-top:2px}
  .doc-ref{font-size:7.5px;color:#94A3B8;text-align:right;margin-top:1px}
  .kpi-row{display:grid;gap:3.5mm;margin-bottom:6mm}
  .kpi-4{grid-template-columns:repeat(4,1fr)}
  .kpi-5{grid-template-columns:repeat(5,1fr)}
  .kpi{padding:3mm 3.5mm;border-radius:4px;border-left:3px solid}
  .kpi-label{font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#64748B;margin-bottom:1px}
  .kpi-val{font-size:16px;font-weight:900;line-height:1}
  .kpi-unit{font-size:9px;font-weight:400}
  .bl{background:#EFF6FF;border-color:#004B8D}.bl .kpi-val{color:#004B8D}
  .gr{background:#F0FDF4;border-color:#00843D}.gr .kpi-val{color:#00843D}
  .am{background:#FFFBEB;border-color:#F59E0B}.am .kpi-val{color:#B45309}
  .vl{background:#F5F3FF;border-color:#7C3AED}.vl .kpi-val{color:#7C3AED}
  .sl{background:#F8FAFC;border-color:#64748B}.sl .kpi-val{color:#374151}
  .section-title{font-size:10px;font-weight:800;color:#0f172a;margin:5mm 0 2mm;display:flex;align-items:center;gap:5px}
  .badge{display:inline-block;padding:1.5px 6px;border-radius:10px;font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:0.3px}
  .badge-phos{background:#DBEAFE;color:#1D4ED8}
  .badge-ster{background:#FEF3C7;color:#92400E}
  .badge-green{background:#D1FAE5;color:#065F46}
  table{width:100%;border-collapse:collapse;font-size:8.5px;margin-bottom:4mm}
  thead tr{background:#0D2B4E;color:#fff}
  th{padding:2.5mm 2mm;text-align:left;font-size:7.5px;font-weight:600;text-transform:uppercase;letter-spacing:0.3px;white-space:nowrap}
  th.r{text-align:right}
  tbody tr:nth-child(even){background:#F8FAFC}
  tbody tr:nth-child(odd){background:#ffffff}
  td{padding:2mm 2mm;border-bottom:1px solid #F1F5F9;vertical-align:middle}
  td.r{text-align:right;font-variant-numeric:tabular-nums}
  td.b{font-weight:700}
  td.blue{color:#004B8D;font-weight:700}
  td.green{color:#00843D;font-weight:700}
  td.red{color:#DC2626}
  .total-row td{background:#EFF6FF;border-top:2px solid #004B8D;font-weight:800;color:#004B8D;padding:2.5mm 2mm}
  .footer{margin-top:8mm;padding-top:3mm;border-top:1px solid #E2E8F0;display:flex;justify-content:space-between;align-items:center;font-size:7.5px;color:#94A3B8}
  .footer .center{color:#475569;font-weight:600}
  .low{background:#FFF1F2!important}
  hr{border:none;border-top:1px dashed #E2E8F0;margin:4mm 0}
`;

const HEADER = (title, period, ref) => `
  <div class="header">
    <div>
      <div style="display:flex;align-items:center;gap:8px">
        <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
          <polygon points="24,4 43,14 43,34 24,44 5,34 5,14" fill="#004B8D" opacity="0.1"/>
          <polygon points="24,4 43,14 43,34 24,44 5,34 5,14" fill="none" stroke="#004B8D" stroke-width="1.5"/>
          <polygon points="24,14 35,20 35,32 24,38 13,32 13,20" fill="#004B8D" opacity="0.2"/>
          <line x1="24" y1="14" x2="24" y2="38" stroke="#004B8D" stroke-width="1.5"/>
          <line x1="13" y1="20" x2="35" y2="32" stroke="#004B8D" stroke-width="1"/>
          <line x1="35" y1="20" x2="13" y2="32" stroke="#004B8D" stroke-width="1"/>
        </svg>
        <div>
          <div class="logo-name">BenGuerir</div>
          <div class="logo-sub">OCP · Exploitation Minière</div>
        </div>
      </div>
    </div>
    <div>
      <div class="doc-title">${title}</div>
      <div class="doc-period">${period}</div>
      <div class="doc-ref">${ref}</div>
    </div>
  </div>`;

const FOOTER = () => `
  <div class="footer">
    <span>Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</span>
    <span class="center">OCP Group · Site BenGuerir · Département Exploitation</span>
    <span>Document confidentiel — Usage interne</span>
  </div>`;

// ── EXPORT JOURNALIER ────────────────────────────────────────────────────────
export function exportProductionPDF({ records, date }) {
  const dateLabel = date ? new Date(date+'T12:00:00').toLocaleDateString('fr-FR',{weekday:'long',year:'numeric',month:'long',day:'numeric'}) : '';
  const phos = records.filter(r => r.type_materiau === 'PHOSPHATE');
  const ster = records.filter(r => r.type_materiau !== 'PHOSPHATE');
  const vPhos = phos.reduce((s,r)=>s+(parseInt(r.total_voyage)||0),0);
  const vSter = ster.reduce((s,r)=>s+(parseInt(r.total_voyage)||0),0);
  const volPhos = phos.reduce((s,r)=>s+(parseFloat(r.volume_m3)||0),0);
  const volSter = ster.reduce((s,r)=>s+(parseFloat(r.volume_m3)||0),0);

  const rows = (list) => list.map((r,i) => `
    <tr>
      <td>${r.niveau||'—'}</td>
      <td class="b">${r.tranchee||'—'}</td>
      <td>${r.panneau||'—'}</td>
      <td>${r.destination||'—'}</td>
      <td class="r">${r.distance_km||'—'}</td>
      <td class="r">${r.nbr_voyage_1er||0}</td>
      <td class="r">${r.nbr_voyage_2e||0}</td>
      <td class="r b">${r.total_voyage||0}</td>
      <td class="r blue">${fmt(r.volume_m3)}</td>
      <td>${r.pelle_1er||'—'} ${r.pelle_2e?'/ '+r.pelle_2e:''}</td>
    </tr>`).join('');

  const tableHead = `<thead><tr>
    <th>Niv.</th><th>Tranchée</th><th>Pan.</th><th>Destination</th>
    <th class="r">km</th><th class="r">V.1ère</th><th class="r">V.2ème</th>
    <th class="r">Total</th><th class="r">Volume m³</th><th>Pelles</th>
  </tr></thead>`;

  const section = (list, label, vol, v, badgeClass) => list.length === 0 ? '' : `
    <div class="section-title">
      <span class="badge ${badgeClass}">${label}</span>
      <span>${list.length} ligne(s)</span>
      <span style="margin-left:auto;font-size:9px;font-weight:600;color:#64748B">${fmt(vol)} m³ &nbsp;·&nbsp; ${fmt(v)} voyages</span>
    </div>
    <table>${tableHead}<tbody>
      ${rows(list)}
      <tr class="total-row">
        <td colspan="5">TOTAL ${label}</td>
        <td class="r">${list.reduce((s,r)=>s+(parseInt(r.nbr_voyage_1er)||0),0)}</td>
        <td class="r">${list.reduce((s,r)=>s+(parseInt(r.nbr_voyage_2e)||0),0)}</td>
        <td class="r">${fmt(v)}</td>
        <td class="r">${fmt(vol)}</td>
        <td></td>
      </tr>
    </tbody></table>`;

  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
  <title>Rapport Journalier BenGuerir — ${date}</title>
  <style>${BASE_STYLES}</style></head><body><div class="page">
  ${HEADER('Rapport Journalier de Production', dateLabel, `Réf: BG-J-${(date||'').replace(/-/g,'')} &nbsp;·&nbsp; ${records.length} lignes`)}
  <div class="kpi-row kpi-4">
    <div class="kpi bl"><div class="kpi-label">Phosphate</div><div class="kpi-val">${fmt(volPhos)}<span class="kpi-unit"> m³</span></div></div>
    <div class="kpi am"><div class="kpi-label">Stérile</div><div class="kpi-val">${fmt(volSter)}<span class="kpi-unit"> m³</span></div></div>
    <div class="kpi gr"><div class="kpi-label">Total Voyages</div><div class="kpi-val">${fmt(vPhos+vSter)}</div></div>
    <div class="kpi sl"><div class="kpi-label">Volume Total</div><div class="kpi-val">${fmt(volPhos+volSter)}<span class="kpi-unit"> m³</span></div></div>
  </div>
  ${section(phos,'Phosphate',volPhos,vPhos,'badge-phos')}
  ${section(ster,'Stérile',volSter,vSter,'badge-ster')}
  ${FOOTER()}
  </div></body></html>`;

  printHTML(html);
}

// ── EXPORT MENSUEL ───────────────────────────────────────────────────────────
export function exportRapportMensuelPDF({ data, month }) {
  const [y, m] = (month||'').split('-');
  const monthLabel = month ? new Date(+y,+m-1,1).toLocaleDateString('fr-FR',{month:'long',year:'numeric'}) : month;

  const dailyRows = (data?.daily_summary||[]).map((d,i) => {
    const low = parseFloat(d.volume_phosphate) < 3000 && parseFloat(d.volume_phosphate) > 0;
    const eff = d.total_voyages>0 ? Math.round(d.total_volume/d.total_voyages) : '—';
    return `<tr${low?' class="low"':''}>
      <td class="b">${d.date}${low?' <span style="color:#EF4444">⚠</span>':''}</td>
      <td class="r blue">${fmt(d.volume_phosphate)}</td>
      <td class="r" style="color:#B45309">${fmt(d.volume_sterile)}</td>
      <td class="r b">${fmt(d.total_volume)}</td>
      <td class="r">${fmt(d.total_voyages)}</td>
      <td class="r green">${eff}</td>
    </tr>`;
  }).join('');

  const trRows = (data?.by_tranchee||[]).map((t,i) => `
    <tr>
      <td class="b">${t.tranchee||'—'}</td>
      <td><span class="badge ${t.type_materiau==='PHOSPHATE'?'badge-phos':'badge-ster'}">${t.type_materiau}</span></td>
      <td class="r blue">${fmt(t.total_volume)}</td>
      <td class="r">${fmt(t.total_voyages)}</td>
      <td class="r green">${t.total_voyages>0?Math.round(t.total_volume/t.total_voyages):'—'}</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
  <title>Rapport Mensuel BenGuerir — ${monthLabel}</title>
  <style>${BASE_STYLES}</style></head><body><div class="page">
  ${HEADER('Rapport Mensuel de Production', monthLabel, `Réf: BG-M-${(month||'').replace('-','')} &nbsp;·&nbsp; ${data?.jours_production||0} jours de production`)}
  <div class="kpi-row kpi-5">
    <div class="kpi bl"><div class="kpi-label">Phosphate</div><div class="kpi-val">${fmt(data?.volume_phosphate)}<span class="kpi-unit"> m³</span></div></div>
    <div class="kpi am"><div class="kpi-label">Stérile</div><div class="kpi-val">${fmt(data?.volume_sterile)}<span class="kpi-unit"> m³</span></div></div>
    <div class="kpi gr"><div class="kpi-label">Volume Total</div><div class="kpi-val">${fmt(data?.total_volume)}<span class="kpi-unit"> m³</span></div></div>
    <div class="kpi vl"><div class="kpi-label">Voyages</div><div class="kpi-val">${fmt(data?.total_voyages)}</div></div>
    <div class="kpi sl"><div class="kpi-label">Jours trav.</div><div class="kpi-val">${data?.jours_production||0}</div></div>
  </div>
  <div class="section-title">Détail Journalier</div>
  <table>
    <thead><tr><th>Date</th><th class="r">Phosphate m³</th><th class="r">Stérile m³</th><th class="r">Total m³</th><th class="r">Voyages</th><th class="r">m³/vg</th></tr></thead>
    <tbody>
      ${dailyRows}
      <tr class="total-row">
        <td>TOTAL MENSUEL</td>
        <td class="r">${fmt(data?.volume_phosphate)}</td>
        <td class="r">${fmt(data?.volume_sterile)}</td>
        <td class="r">${fmt(data?.total_volume)}</td>
        <td class="r">${fmt(data?.total_voyages)}</td>
        <td class="r">${data?.total_voyages>0?Math.round(data?.total_volume/data?.total_voyages):'—'}</td>
      </tr>
    </tbody>
  </table>
  <div class="section-title">Performance par Tranchée</div>
  <table>
    <thead><tr><th>Tranchée</th><th>Type</th><th class="r">Volume m³</th><th class="r">Voyages</th><th class="r">m³/voyage</th></tr></thead>
    <tbody>${trRows}</tbody>
  </table>
  ${FOOTER()}
  </div></body></html>`;

  printHTML(html);
}
