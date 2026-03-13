const fmt = n => Number(n || 0).toLocaleString('fr-FR');

function printHTML(html) {
  const win = window.open('', '_blank', 'width=1100,height=800');
  if (!win) { alert('Autoriser les popups pour exporter en PDF'); return; }
  win.document.write(html);
  win.document.close();
  win.onload = () => { setTimeout(() => win.print(), 500); };
}

const BASE_STYLES = `
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',system-ui,sans-serif;font-size:10px;color:#0f172a;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  @page{margin:14mm 12mm;size:A4}
  .page{padding:0}
  .header{display:flex;justify-content:space-between;align-items:center;padding-bottom:5mm;border-bottom:2.5px solid #004B8D;margin-bottom:6mm}
  .logo-name{font-size:20px;font-weight:900;color:#004B8D;letter-spacing:-0.5px}
  .logo-sub{font-size:8px;color:#64748B;text-transform:uppercase;letter-spacing:1.5px;margin-top:1px}
  .doc-title{font-size:13px;font-weight:800;color:#0f172a;text-align:right}
  .doc-period{font-size:11px;font-weight:600;color:#00843D;text-align:right;margin-top:2px}
  .doc-ref{font-size:7.5px;color:#94A3B8;text-align:right;margin-top:1px}
  .kpi-row{display:grid;gap:3.5mm;margin-bottom:6mm}
  .kpi-4{grid-template-columns:repeat(4,1fr)}
  .kpi-5{grid-template-columns:repeat(5,1fr)}
  .kpi-6{grid-template-columns:repeat(6,1fr)}
  .kpi{padding:3mm 3.5mm;border-radius:4px;border-left:3px solid}
  .kpi-label{font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#64748B;margin-bottom:1px}
  .kpi-val{font-size:16px;font-weight:900;line-height:1}
  .kpi-unit{font-size:9px;font-weight:400}
  .bl{background:#EFF6FF;border-color:#004B8D}.bl .kpi-val{color:#004B8D}
  .gr{background:#F0FDF4;border-color:#00843D}.gr .kpi-val{color:#00843D}
  .am{background:#FFFBEB;border-color:#F59E0B}.am .kpi-val{color:#B45309}
  .vl{background:#F5F3FF;border-color:#7C3AED}.vl .kpi-val{color:#7C3AED}
  .sl{background:#F8FAFC;border-color:#64748B}.sl .kpi-val{color:#374151}
  .rd{background:#FFF1F2;border-color:#EF4444}.rd .kpi-val{color:#DC2626}
  .section-title{font-size:10px;font-weight:800;color:#0f172a;margin:5mm 0 2mm;display:flex;align-items:center;gap:5px;border-bottom:1px solid #E2E8F0;padding-bottom:1.5mm}
  .badge{display:inline-block;padding:1.5px 6px;border-radius:10px;font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:0.3px}
  .badge-phos{background:#DBEAFE;color:#1D4ED8}
  .badge-ster{background:#FEF3C7;color:#92400E}
  .badge-week{background:#EDE9FE;color:#6D28D9}
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
  td.amber{color:#B45309;font-weight:700}
  td.purple{color:#7C3AED;font-weight:700}
  .total-row td{background:#1A2332;color:#fff;font-weight:800;padding:2.5mm 2mm;border-top:2px solid #0D2B4E}
  .subtotal-row td{background:#EFF6FF;color:#004B8D;font-weight:700;padding:2mm 2mm;border-top:1.5px solid #BFDBFE}
  .footer{margin-top:8mm;padding-top:3mm;border-top:1px solid #E2E8F0;display:flex;justify-content:space-between;align-items:center;font-size:7.5px;color:#94A3B8}
  .footer .center{color:#475569;font-weight:600}
  .low{background:#FFF1F2!important}
  .warn{color:#EF4444;font-size:8px}
  hr{border:none;border-top:1px dashed #E2E8F0;margin:4mm 0}
  .week-header{background:#1E1B4B;color:#fff;padding:2.5mm 3mm;border-radius:3px;margin:4mm 0 2mm;display:flex;justify-content:space-between;align-items:center}
  .week-header .wn{font-size:10px;font-weight:700}
  .week-header .wp{font-size:8.5px;opacity:0.7;font-family:monospace}
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

  const rows = (list) => list.map(r => `
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

  const section = (list, label, vol, v, badgeClass) => list.length===0 ? '' : `
    <div class="section-title">
      <span class="badge ${badgeClass}">${label}</span>
      <span>${list.length} ligne(s)</span>
      <span style="margin-left:auto;font-size:9px;font-weight:600;color:#64748B">${fmt(vol)} m³ &nbsp;·&nbsp; ${fmt(v)} voyages</span>
    </div>
    <table>${tableHead}<tbody>
      ${rows(list)}
      <tr class="subtotal-row">
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

// ── EXPORT HEBDOMADAIRE ──────────────────────────────────────────────────────
export function exportRapportHebdoPDF({ weeks, month, daily, monthLabel, cycleLabel }) {
  // weeks: array of { num, from, to, label, jours, vol_phosphate, vol_sterile, total_volume, total_voyages, eff, daily[] }
  const totM = weeks.reduce((a,w)=>({vp:a.vp+w.vol_phosphate,vs:a.vs+w.vol_sterile,vt:a.vt+w.total_volume,vy:a.vy+w.total_voyages}),{vp:0,vs:0,vt:0,vy:0});
  const jours_total = weeks.reduce((a,w)=>a+w.jours,0);
  const isSingleWeek = weeks.length===1;

  const weekRows = weeks.map((w,i) => `
    <tr>
      <td><span class="badge badge-week">S${w.num}</span></td>
      <td class="b" style="font-family:monospace;font-size:8px">${w.label}</td>
      <td class="r">${w.jours}/7</td>
      <td class="r blue">${fmt(w.vol_phosphate)}</td>
      <td class="r amber">${fmt(w.vol_sterile)}</td>
      <td class="r b">${fmt(w.total_volume)}</td>
      <td class="r">${fmt(w.total_voyages)}</td>
      <td class="r ${w.eff>=14?'green':w.eff>0?'red':''}">${w.eff||'—'}</td>
      <td class="r">${w.total_voyages>0?Math.round(w.vol_phosphate/w.total_voyages*100)+'%':'—'}</td>
    </tr>`).join('');

  // Daily detail per week
  const weekDailyBlocks = weeks.map(w => {
    const d = w.daily || [];
    if (!d.length) return '';
    const rows = d.map(r => {
      const eff = r.total_voyages>0?Math.round(r.total_volume/r.total_voyages):0;
      const low = parseFloat(r.volume_phosphate)<3000&&parseFloat(r.volume_phosphate)>0;
      return `<tr${low?' class="low"':''}>
        <td class="b">${r.date||''}${low?' <span class="warn">⚠</span>':''}</td>
        <td class="r blue">${fmt(r.volume_phosphate)}</td>
        <td class="r amber">${fmt(r.volume_sterile)}</td>
        <td class="r b">${fmt(r.total_volume)}</td>
        <td class="r">${fmt(r.total_voyages)}</td>
        <td class="r ${eff>=14?'green':eff>0?'red':''}">${eff||'—'}</td>
      </tr>`;
    }).join('');
    const st = d.reduce((a,r)=>({vp:a.vp+(parseFloat(r.volume_phosphate)||0),vs:a.vs+(parseFloat(r.volume_sterile)||0),vt:a.vt+(parseFloat(r.total_volume)||0),vy:a.vy+(parseInt(r.total_voyages)||0)}),{vp:0,vs:0,vt:0,vy:0});
    return `
      <div class="week-header">
        <span class="wn">📅 Semaine ${w.num}</span>
        <span class="wp">${w.label} &nbsp;·&nbsp; ${w.jours} jour(s) de production</span>
      </div>
      <table>
        <thead><tr><th>Date</th><th class="r">Phosphate m³</th><th class="r">Stérile m³</th><th class="r">Total m³</th><th class="r">Voyages</th><th class="r">m³/vg</th></tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr class="subtotal-row">
          <td>Sous-total S${w.num}</td>
          <td class="r">${fmt(Math.round(st.vp))}</td>
          <td class="r">${fmt(Math.round(st.vs))}</td>
          <td class="r b">${fmt(Math.round(st.vt))}</td>
          <td class="r">${fmt(st.vy)}</td>
          <td class="r">${st.vy>0?Math.round(st.vt/st.vy):'—'}</td>
        </tr></tfoot>
      </table>`;
  }).join('');

  const title = isSingleWeek ? `Rapport Hebdomadaire — Semaine ${weeks[0].num}` : 'Rapport Hebdomadaire — Synthèse Mensuelle';
  const period = isSingleWeek ? `${monthLabel} · ${weeks[0].label}` : `${monthLabel} (${cycleLabel})`;

  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
  <title>${title}</title>
  <style>${BASE_STYLES}</style></head><body><div class="page">
  ${HEADER(title, period, `Réf: BG-H-${(month||'').replace('-','')}${isSingleWeek?'-S'+weeks[0].num:''} &nbsp;·&nbsp; ${weeks.length} semaine(s) · ${jours_total} jours de production`)}

  <div class="kpi-row kpi-6">
    <div class="kpi bl"><div class="kpi-label">Phosphate</div><div class="kpi-val">${fmt(Math.round(totM.vp))}<span class="kpi-unit"> m³</span></div></div>
    <div class="kpi am"><div class="kpi-label">Stérile</div><div class="kpi-val">${fmt(Math.round(totM.vs))}<span class="kpi-unit"> m³</span></div></div>
    <div class="kpi gr"><div class="kpi-label">Volume Total</div><div class="kpi-val">${fmt(Math.round(totM.vt))}<span class="kpi-unit"> m³</span></div></div>
    <div class="kpi vl"><div class="kpi-label">Voyages</div><div class="kpi-val">${fmt(totM.vy)}</div></div>
    <div class="kpi sl"><div class="kpi-label">m³/Voyage</div><div class="kpi-val">${totM.vy>0?Math.round(totM.vt/totM.vy):'—'}</div></div>
    <div class="kpi sl"><div class="kpi-label">Jours trav.</div><div class="kpi-val">${jours_total}</div></div>
  </div>

  ${weeks.length>1?`
  <div class="section-title">📊 Synthèse par Semaine</div>
  <table>
    <thead><tr>
      <th>Sem.</th><th>Période</th><th class="r">Jours</th>
      <th class="r">Phosphate m³</th><th class="r">Stérile m³</th>
      <th class="r">Total m³</th><th class="r">Voyages</th>
      <th class="r">m³/vg</th><th class="r">%Phos</th>
    </tr></thead>
    <tbody>${weekRows}</tbody>
    <tfoot><tr class="total-row">
      <td colspan="3">TOTAL PÉRIODE</td>
      <td class="r">${fmt(Math.round(totM.vp))}</td>
      <td class="r">${fmt(Math.round(totM.vs))}</td>
      <td class="r">${fmt(Math.round(totM.vt))}</td>
      <td class="r">${fmt(totM.vy)}</td>
      <td class="r">${totM.vy>0?Math.round(totM.vt/totM.vy):'—'}</td>
      <td class="r">${totM.vy>0?Math.round(totM.vp/totM.vy*100)+'%':'—'}</td>
    </tr></tfoot>
  </table>
  <hr/>
  `:''}

  <div class="section-title">📋 Détail Journalier par Semaine</div>
  ${weekDailyBlocks}

  ${FOOTER()}
  </div></body></html>`;

  printHTML(html);
}

// ── EXPORT MENSUEL ───────────────────────────────────────────────────────────
export function exportRapportMensuelPDF({ data, month }) {
  const [y, m] = (month||'').split('-');
  const monthLabel = month ? new Date(+y,+m-1,1).toLocaleDateString('fr-FR',{month:'long',year:'numeric'}) : month;

  const dailyRows = (data?.daily_summary||[]).map(d => {
    const low = parseFloat(d.volume_phosphate)<3000&&parseFloat(d.volume_phosphate)>0;
    const eff = d.total_voyages>0?Math.round(d.total_volume/d.total_voyages):'—';
    return `<tr${low?' class="low"':''}>
      <td class="b">${d.date}${low?' <span class="warn">⚠</span>':''}</td>
      <td class="r blue">${fmt(d.volume_phosphate)}</td>
      <td class="r amber">${fmt(d.volume_sterile)}</td>
      <td class="r b">${fmt(d.total_volume)}</td>
      <td class="r">${fmt(d.total_voyages)}</td>
      <td class="r green">${eff}</td>
    </tr>`;
  }).join('');

  const trRows = (data?.by_tranchee||[]).map(t => `
    <tr>
      <td class="b">${t.tranchee||'—'}</td>
      <td><span class="badge ${t.type_materiau==='PHOSPHATE'?'badge-phos':'badge-ster'}">${t.type_materiau}</span></td>
      <td class="r blue">${fmt(t.total_volume)}</td>
      <td class="r">${fmt(t.total_voyages)}</td>
      <td class="r green">${t.total_voyages>0?Math.round(t.total_volume/t.total_voyages):'—'}</td>
    </tr>`).join('');

  const vPhos = data?.volume_phosphate||0;
  const vSter = data?.volume_sterile||0;
  const vTot  = data?.total_volume||0;
  const voyages = data?.total_voyages||0;

  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
  <title>Rapport Mensuel BenGuerir — ${monthLabel}</title>
  <style>${BASE_STYLES}</style></head><body><div class="page">
  ${HEADER('Rapport Mensuel de Production', monthLabel, `Réf: BG-M-${(month||'').replace('-','')} &nbsp;·&nbsp; ${data?.jours_production||0} jours de production`)}

  <div class="kpi-row kpi-6">
    <div class="kpi bl"><div class="kpi-label">Phosphate</div><div class="kpi-val">${fmt(vPhos)}<span class="kpi-unit"> m³</span></div></div>
    <div class="kpi am"><div class="kpi-label">Stérile</div><div class="kpi-val">${fmt(vSter)}<span class="kpi-unit"> m³</span></div></div>
    <div class="kpi gr"><div class="kpi-label">Volume Total</div><div class="kpi-val">${fmt(vTot)}<span class="kpi-unit"> m³</span></div></div>
    <div class="kpi vl"><div class="kpi-label">Voyages</div><div class="kpi-val">${fmt(voyages)}</div></div>
    <div class="kpi sl"><div class="kpi-label">m³/Voyage</div><div class="kpi-val">${voyages>0?Math.round(vTot/voyages):'—'}</div></div>
    <div class="kpi sl"><div class="kpi-label">Jours trav.</div><div class="kpi-val">${data?.jours_production||0}</div></div>
  </div>

  <div class="section-title">📋 Détail Journalier</div>
  <table>
    <thead><tr>
      <th>Date</th><th class="r">Phosphate m³</th><th class="r">Stérile m³</th>
      <th class="r">Total m³</th><th class="r">Voyages</th><th class="r">m³/vg</th>
    </tr></thead>
    <tbody>${dailyRows}</tbody>
    <tfoot><tr class="total-row">
      <td>TOTAL MENSUEL</td>
      <td class="r">${fmt(vPhos)}</td>
      <td class="r">${fmt(vSter)}</td>
      <td class="r">${fmt(vTot)}</td>
      <td class="r">${fmt(voyages)}</td>
      <td class="r">${voyages>0?Math.round(vTot/voyages):'—'}</td>
    </tr></tfoot>
  </table>

  <div class="section-title">🏗 Performance par Tranchée</div>
  <table>
    <thead><tr>
      <th>Tranchée</th><th>Type</th><th class="r">Volume m³</th>
      <th class="r">Voyages</th><th class="r">m³/voyage</th>
    </tr></thead>
    <tbody>${trRows}</tbody>
  </table>

  ${(data?.weekly_summary||[]).length>0?`
  <div class="section-title">📅 Synthèse Hebdomadaire</div>
  <table>
    <thead><tr>
      <th>Semaine</th><th class="r">Phosphate m³</th><th class="r">Stérile m³</th>
      <th class="r">Total m³</th><th class="r">Voyages</th><th class="r">Jours</th><th class="r">m³/vg</th>
    </tr></thead>
    <tbody>
      ${(data.weekly_summary||[]).map((w,i)=>`<tr>
        <td><span class="badge badge-week">S${i+1}</span> ${w.label||''}</td>
        <td class="r blue">${fmt(w.vol_phosphate)}</td>
        <td class="r amber">${fmt(w.vol_sterile)}</td>
        <td class="r b">${fmt(w.total_volume)}</td>
        <td class="r">${fmt(w.total_voyages)}</td>
        <td class="r">${w.jours||'—'}</td>
        <td class="r green">${w.total_voyages>0?Math.round(w.total_volume/w.total_voyages):'—'}</td>
      </tr>`).join('')}
    </tbody>
  </table>`:''
  }

  ${FOOTER()}
  </div></body></html>`;

  printHTML(html);
}
