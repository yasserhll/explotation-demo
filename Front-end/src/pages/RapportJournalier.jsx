import { useState, useEffect, useRef } from 'react';
import { rotationAPI } from '../services/api';

const getToday = () => { const n=new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`; };
const fmt  = n => Number(n||0).toLocaleString('fr-FR');
const fmtD = (n,d=1) => Number(n||0).toFixed(d).replace('.',',');
const labelDateFull = d => { if(!d) return ''; try { return new Date(d+'T12:00:00').toLocaleDateString('fr-FR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'}); } catch { return d; } };
const labelDateShort = d => { if(!d) return ''; try { return new Date(d+'T12:00:00').toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric'}); } catch { return d; } };

function parsePanneau(s) {
  if (!s) return { tranchee:'', panneau:'', destination:'' };
  const parts = s.split(' / ');
  const dest  = parts.length > 1 ? parts[parts.length-1].trim() : '';
  const tp    = parts[0].trim();
  const match = tp.match(/\b(P\d+)\b/);
  const pNum  = match ? match[1] : '';
  const tranchee = tp.replace(pNum,'').trim().replace(/\s+$/,'').trim();
  return { tranchee, panneau: pNum, destination: dest || tp };
}

// ── Table de production (PHOSPHATE ou STERILE) ─────────────────────────────
function ProductionTable({ title, color, bgHeader, bgRows, bgTotal, rows, volFactor }) {
  const totVgs1  = rows.reduce((a,r)=>a+(r.vgs_1er||0),0);
  const totVgs2  = rows.reduce((a,r)=>a+(r.vgs_2e ||0),0);
  const totTotal = rows.reduce((a,r)=>a+(r.total  ||0),0);
  const totVol   = rows.reduce((a,r)=>a+(r.volume ||0),0);

  const thStyle = (extra={}) => ({ padding:'5px 8px', fontSize:'11px', fontWeight:700, color:'white', textAlign:'center', whiteSpace:'nowrap', border:'1px solid rgba(255,255,255,0.2)', ...extra });
  const tdStyle = (extra={}) => ({ padding:'5px 8px', fontSize:'11px', border:'1px solid #E5E7EB', textAlign:'center', ...extra });

  return (
    <div style={{ marginBottom:'16px', breakInside:'avoid' }}>
      <div style={{ background:color, color:'white', padding:'6px 12px', fontWeight:800, fontSize:'13px', textTransform:'uppercase', letterSpacing:'0.5px', borderRadius:'6px 6px 0 0', display:'flex', alignItems:'center', gap:'8px' }}>
        <span>{title === 'PHOSPHATE' ? '🔵' : '🟡'}</span> {title}
      </div>
      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'11px' }}>
          <thead>
            <tr style={{ background: color+'CC' }}>
              <th style={thStyle({textAlign:'left'})}>Niveau</th>
              <th style={thStyle({textAlign:'left'})}>Tranchée</th>
              <th style={thStyle()}>Panneau</th>
              <th style={thStyle({textAlign:'left', minWidth:'120px'})}>Destination</th>
              <th style={thStyle()}>Distance<br/>en Km</th>
              <th style={thStyle()}>Nbr Voyage<br/>1er</th>
              <th style={thStyle()}>Nbr Voyage<br/>2e</th>
              <th style={thStyle()}>Total<br/>Voyage</th>
              <th style={thStyle()}>Volume<br/>(m³)</th>
              <th style={thStyle()}>Camion<br/>1er</th>
              <th style={thStyle()}>Camion<br/>2e</th>
              <th style={thStyle()}>Pelle 1er</th>
              <th style={thStyle()}>Pelle 2e</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={13} style={{ ...tdStyle(), textAlign:'center', color:'#9CA3AF', fontStyle:'italic', padding:'16px' }}>Aucune donnée</td></tr>
            ) : rows.map((row, i) => {
              const parsed = parsePanneau(row.panneau);
              const rowBg  = i % 2 === 0 ? '#FFFFFF' : bgRows;
              return (
                <tr key={i} style={{ background: rowBg }}>
                  <td style={tdStyle({textAlign:'left', fontWeight:700, color:'#374151'})}>{row.niveau||'—'}</td>
                  <td style={tdStyle({textAlign:'left', fontWeight:600, color:'#374151'})}>{parsed.tranchee||'—'}</td>
                  <td style={tdStyle({fontWeight:600, color:color})}>{parsed.panneau||'—'}</td>
                  <td style={tdStyle({textAlign:'left'})}>{parsed.destination||row.panneau}</td>
                  <td style={tdStyle()}>{row.km ? fmtD(row.km) : '—'}</td>
                  <td style={tdStyle({fontWeight:700, color:'#1F2937'})}>{fmt(row.vgs_1er)||'—'}</td>
                  <td style={tdStyle({fontWeight:700, color:'#1F2937'})}>{fmt(row.vgs_2e)||'—'}</td>
                  <td style={tdStyle({fontWeight:800, color:color})}>{fmt(row.total)||'—'}</td>
                  <td style={tdStyle({fontWeight:800, color:color})}>{fmt(row.volume)||'—'}</td>
                  <td style={tdStyle()}>{row.camions_1er||'—'}</td>
                  <td style={tdStyle()}>{row.camions_2e||'—'}</td>
                  <td style={tdStyle({fontSize:'10px', color:'#7C3AED', fontFamily:'monospace'})}>{(row.pelles_1er||[]).join('+') || '—'}</td>
                  <td style={tdStyle({fontSize:'10px', color:'#7C3AED', fontFamily:'monospace'})}>{(row.pelles_2e||[]).join('+')  || '—'}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background:bgTotal }}>
              <td colSpan={4} style={{ ...tdStyle({textAlign:'left', fontWeight:800, color:color, border:'1px solid #E5E7EB', padding:'6px 10px'}), background:bgTotal }}>TOTAL</td>
              <td style={{ ...tdStyle({border:'1px solid #E5E7EB'}), background:bgTotal }}></td>
              <td style={{ ...tdStyle({fontWeight:800, color:color, border:'1px solid #E5E7EB'}), background:bgTotal }}>{fmt(totVgs1)||'—'}</td>
              <td style={{ ...tdStyle({fontWeight:800, color:color, border:'1px solid #E5E7EB'}), background:bgTotal }}>{fmt(totVgs2)||'—'}</td>
              <td style={{ ...tdStyle({fontWeight:800, color:color, border:'1px solid #E5E7EB'}), background:bgTotal }}>{fmt(totTotal)||'—'}</td>
              <td style={{ ...tdStyle({fontWeight:800, color:color, border:'1px solid #E5E7EB'}), background:bgTotal }}>{fmt(totVol)||'—'}</td>
              <td colSpan={4} style={{ ...tdStyle({border:'1px solid #E5E7EB'}), background:bgTotal }}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ── Page principale ────────────────────────────────────────────────────────
export default function RapportJournalier() {
  const [date,        setDate]    = useState(getToday());
  const [data,        setData]    = useState(null);
  const [loading,     setLoading] = useState(false);
  const [error,       setError]   = useState('');
  // Valeurs gasoil éditables (saisie manuelle)
  const [gasoilCam,   setGasoilCam]   = useState('');
  const [gasoilEngin, setGasoilEngin] = useState('');
  // Fleet éditable
  const [fleet,       setFleet]   = useState(null);
  // Remarques éditables
  const [remarques,   setRemarques] = useState('');
  const printRef = useRef(null);

  const load = async d => {
    setLoading(true); setError('');
    try {
      const r = await rotationAPI.rapportJournalier(d);
      setData(r.data);
      setFleet(r.data.fleet?.map(f=>({...f})) || []);
      setRemarques((r.data.remarques||[]).join('\n'));
    } catch(e) { setError(e.response?.data?.message || 'Erreur de chargement'); }
    setLoading(false);
  };

  useEffect(() => { load(date); }, [date]);

  const handlePrint = () => window.print();

  const gasoilTotal = (parseInt(gasoilCam)||0) + (parseInt(gasoilEngin)||0);

  const thF = { padding:'5px 8px', fontSize:'11px', fontWeight:700, border:'1px solid #CBD5E1', background:'#1D4ED8', color:'white', textAlign:'center', whiteSpace:'nowrap' };
  const tdF = (bg='white') => ({ padding:'5px 8px', fontSize:'11px', border:'1px solid #E5E7EB', textAlign:'center', background:bg });

  return (
    <>
      {/* CSS Print */}
      <style>{`
        @media print {
          body { margin:0; padding:0; }
          .no-print { display:none !important; }
          .print-page { padding:10mm 12mm; }
          .print-header { display:flex !important; }
          @page { size:A4 landscape; margin:8mm; }
        }
        @media screen { .print-page { padding:0; } }
      `}</style>

      <div className="print-page" ref={printRef}>
        {/* Contrôles (cachés à l'impression) */}
        <div className="no-print" style={{ background:'white',borderRadius:'14px',border:'1px solid #F1F5F9',padding:'14px 18px',marginBottom:'14px',boxShadow:'0 1px 8px rgba(0,0,0,0.05)',display:'flex',flexWrap:'wrap',gap:'10px',alignItems:'center',justifyContent:'space-between' }}>
          <div>
            <div style={{ fontWeight:700,fontSize:'16px',color:'#111827' }}>Rapport de Production Journalier</div>
            <div style={{ fontSize:'12px',color:'#9CA3AF',marginTop:'2px' }}>Site de Benguerir — OCP</div>
          </div>
          <div style={{ display:'flex',gap:'8px',alignItems:'center',flexWrap:'wrap' }}>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{ border:'1px solid #E5E7EB',borderRadius:'9px',padding:'7px 10px',fontSize:'13px',background:'#F9FAFB',outline:'none' }}/>
            <button onClick={()=>load(date)} style={{ padding:'7px 14px',borderRadius:'9px',fontWeight:600,fontSize:'13px',border:'1px solid #E5E7EB',background:'#F9FAFB',cursor:'pointer',color:'#374151' }}>↺ Actualiser</button>
            <button onClick={handlePrint} style={{ display:'flex',alignItems:'center',gap:'6px',padding:'8px 16px',borderRadius:'9px',fontWeight:700,fontSize:'14px',border:'none',background:'linear-gradient(135deg,#004B8D,#0066CC)',color:'white',cursor:'pointer' }}>
              🖨️ Imprimer
            </button>
          </div>
        </div>

        {loading && (
          <div style={{ display:'flex',alignItems:'center',justifyContent:'center',padding:'80px',color:'#9CA3AF' }}>
            <div style={{ width:'20px',height:'20px',border:'2px solid #3B82F6',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.8s linear infinite',marginRight:'10px' }}/>Chargement…
          </div>
        )}

        {error && !loading && (
          <div style={{ background:'#FEF2F2',border:'1px solid #FECACA',color:'#DC2626',padding:'14px 18px',borderRadius:'10px',fontWeight:600 }}>{error}</div>
        )}

        {data && !loading && (
          <div style={{ background:'white',borderRadius:'14px',border:'1px solid #E5E7EB',padding:'16px 20px',boxShadow:'0 1px 8px rgba(0,0,0,0.05)' }}>

            {/* En-tête rapport */}
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px',paddingBottom:'12px',borderBottom:'2px solid #004B8D' }}>
              <div style={{ display:'flex',alignItems:'center',gap:'14px' }}>
                {/* Logo OCP simplifié */}
                <div style={{ width:'50px',height:'50px',borderRadius:'8px',background:'linear-gradient(135deg,#004B8D,#0066CC)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                  <svg viewBox="0 0 36 36" fill="none" width="34" height="34">
                    <polygon points="18,5 28,11 28,23 18,29 8,23 8,11" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.9"/>
                    <polygon points="18,10 24,14 24,22 18,26 12,22 12,14" fill="white" fillOpacity="0.25"/>
                    <path d="M13 19L18 14L23 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="18" y1="14" x2="18" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight:800,fontSize:'16px',color:'#004B8D',letterSpacing:'0.3px' }}>TRANSWIN</div>
                  <div style={{ fontSize:'10px',color:'#6B7280',fontWeight:500 }}>Site de Benguerir — OCP</div>
                </div>
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontWeight:800,fontSize:'15px',color:'#111827',textTransform:'uppercase',letterSpacing:'0.5px' }}>Rapport de Production Journalière</div>
                <div style={{ fontWeight:700,fontSize:'13px',color:'#004B8D',marginTop:'3px',textTransform:'capitalize' }}>Site de Benguerir — {labelDateShort(date)}</div>
              </div>
              <div style={{ textAlign:'right',fontSize:'11px',color:'#6B7280' }}>
                <div>{labelDateFull(date)}</div>
                <div style={{ fontWeight:600,color:'#374151',marginTop:'2px' }}>{data.nb_camions} camion{data.nb_camions>1?'s':''} actif{data.nb_camions>1?'s':''}</div>
              </div>
            </div>

            {/* Tables production */}
            <ProductionTable title="PHOSPHATE" color="#1D4ED8" bgHeader="#DBEAFE" bgRows="#EFF6FF" bgTotal="#DBEAFE" rows={data.phosphate||[]} volFactor={16}/>
            <ProductionTable title="STERILE 50T" color="#B45309" bgHeader="#FEF3C7" bgRows="#FFFBEB" bgTotal="#FEF3C7" rows={data.sterile||[]} volFactor={14}/>

            {/* Fleet + Gasoil + Remarques */}
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginTop:'4px' }}>

              {/* Parc machines */}
              <div>
                <div style={{ fontWeight:700,fontSize:'12px',color:'#374151',marginBottom:'6px',textTransform:'uppercase',letterSpacing:'0.4px' }}>Parc Machines</div>
                <table style={{ width:'100%',borderCollapse:'collapse',fontSize:'11px' }}>
                  <thead>
                    <tr>
                      <th style={thF}>Type</th>
                      <th style={thF}>Total parc</th>
                      <th style={thF}>Parc Dispo</th>
                      <th style={thF}>Total parc</th>
                      <th style={thF}>Parc Dispo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(fleet||[]).map((f,i)=>(
                      <tr key={i}>
                        <td style={tdF(i%2===0?'white':'#F8FAFC')}>{f.label}</td>
                        <td style={tdF(i%2===0?'white':'#F8FAFC')}>
                          <input type="number" value={f.total} min={0}
                            onChange={e=>setFleet(p=>{const n=[...p];n[i]={...n[i],total:parseInt(e.target.value)||0};return n;})}
                            className="no-print" style={{ width:'40px',border:'none',background:'transparent',textAlign:'center',fontSize:'11px',outline:'none',fontWeight:600 }}/>
                          <span className="print-only">{f.total}</span>
                        </td>
                        <td style={tdF(i%2===0?'white':'#F8FAFC')}>
                          <input type="number" value={f.dispo_1er} min={0}
                            onChange={e=>setFleet(p=>{const n=[...p];n[i]={...n[i],dispo_1er:parseInt(e.target.value)||0};return n;})}
                            className="no-print" style={{ width:'40px',border:'none',background:'transparent',textAlign:'center',fontSize:'11px',outline:'none',fontWeight:600,color:'#16a34a' }}/>
                          <span className="print-only" style={{color:'#16a34a'}}>{f.dispo_1er}</span>
                        </td>
                        <td style={tdF(i%2===0?'white':'#F8FAFC')}>
                          <input type="number" value={f.total} min={0}
                            onChange={e=>setFleet(p=>{const n=[...p];n[i]={...n[i],total:parseInt(e.target.value)||0};return n;})}
                            className="no-print" style={{ width:'40px',border:'none',background:'transparent',textAlign:'center',fontSize:'11px',outline:'none',fontWeight:600 }}/>
                          <span className="print-only">{f.total}</span>
                        </td>
                        <td style={tdF(i%2===0?'white':'#F8FAFC')}>
                          <input type="number" value={f.dispo_2e} min={0}
                            onChange={e=>setFleet(p=>{const n=[...p];n[i]={...n[i],dispo_2e:parseInt(e.target.value)||0};return n;})}
                            className="no-print" style={{ width:'40px',border:'none',background:'transparent',textAlign:'center',fontSize:'11px',outline:'none',fontWeight:600,color:'#16a34a' }}/>
                          <span className="print-only" style={{color:'#16a34a'}}>{f.dispo_2e}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Gasoil */}
                <div style={{ marginTop:'10px' }}>
                  <div style={{ fontWeight:700,fontSize:'12px',color:'#374151',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'0.4px' }}>Consommation Gasoil</div>
                  <table style={{ width:'100%',borderCollapse:'collapse',fontSize:'11px' }}>
                    <thead>
                      <tr>
                        <th style={{...thF,background:'#374151'}}> </th>
                        <th style={{...thF,background:'#374151'}}>Camions</th>
                        <th style={{...thF,background:'#374151'}}>Engins</th>
                        <th style={{...thF,background:'#374151'}}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={tdF()}><span style={{fontWeight:700,color:'#374151'}}>Cons. Gasoil</span></td>
                        <td style={tdF()}>
                          <input type="number" value={gasoilCam} min={0} onChange={e=>setGasoilCam(e.target.value)}
                            placeholder="—" style={{ width:'60px',border:'1px solid #E5E7EB',borderRadius:'4px',padding:'2px 4px',textAlign:'center',fontSize:'11px',outline:'none' }}/>
                        </td>
                        <td style={tdF()}>
                          <input type="number" value={gasoilEngin} min={0} onChange={e=>setGasoilEngin(e.target.value)}
                            placeholder="—" style={{ width:'60px',border:'1px solid #E5E7EB',borderRadius:'4px',padding:'2px 4px',textAlign:'center',fontSize:'11px',outline:'none' }}/>
                        </td>
                        <td style={tdF('#F0FDF4')}>
                          <span style={{fontWeight:800,color:'#16a34a'}}>{gasoilTotal > 0 ? fmt(gasoilTotal) : '—'}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Remarques */}
              <div>
                <div style={{ fontWeight:700,fontSize:'12px',color:'#374151',marginBottom:'6px',textTransform:'uppercase',letterSpacing:'0.4px' }}>Remarques</div>
                <div style={{ border:'1px solid #E5E7EB',borderRadius:'8px',overflow:'hidden' }}>
                  <div style={{ background:'#F8FAFC',padding:'4px 8px',fontSize:'10px',color:'#9CA3AF',borderBottom:'1px solid #E5E7EB',fontWeight:600,textTransform:'uppercase' }}>
                    Observations / Incidents
                  </div>
                  <textarea
                    value={remarques}
                    onChange={e=>setRemarques(e.target.value)}
                    rows={8}
                    style={{ width:'100%',border:'none',padding:'8px 10px',fontSize:'11px',lineHeight:'1.6',outline:'none',resize:'vertical',boxSizing:'border-box',minHeight:'160px',color:'#374151' }}
                    placeholder="Saisissez les observations de la journée…"
                  />
                </div>

                {/* KPIs impression */}
                <div style={{ marginTop:'10px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px' }}>
                  {[
                    {l:'Total voyages', v:fmt((data.phosphate||[]).reduce((a,r)=>a+(r.total||0),0)+(data.sterile||[]).reduce((a,r)=>a+(r.total||0),0)), c:'#374151'},
                    {l:'Volume total',  v:fmt((data.phosphate||[]).reduce((a,r)=>a+(r.volume||0),0)+(data.sterile||[]).reduce((a,r)=>a+(r.volume||0),0))+' m³', c:'#004B8D'},
                    {l:'Volume phosphate', v:fmt((data.phosphate||[]).reduce((a,r)=>a+(r.volume||0),0))+' m³', c:'#1D4ED8'},
                    {l:'Volume stérile',   v:fmt((data.sterile||[]).reduce((a,r)=>a+(r.volume||0),0))+' m³',   c:'#B45309'},
                  ].map((s,i)=>(
                    <div key={i} style={{ background:'#F8FAFC',borderRadius:'8px',padding:'8px 10px',border:'1px solid #E5E7EB',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                      <span style={{ fontSize:'11px',color:'#6B7280',fontWeight:500 }}>{s.l}</span>
                      <span style={{ fontSize:'13px',fontWeight:800,color:s.c }}>{s.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop:'12px',paddingTop:'10px',borderTop:'1px solid #E5E7EB',display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:'10px',color:'#9CA3AF' }}>
              <span>Rapport généré — {new Date().toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})}</span>
              <span style={{ fontWeight:600,color:'#004B8D' }}>OCP BenGuerir · Exploitation Minière</span>
            </div>
          </div>
        )}

        {!data && !loading && !error && (
          <div style={{ textAlign:'center',padding:'80px 20px',color:'#9CA3AF' }}>
            <div style={{ fontSize:'44px',marginBottom:'12px' }}>📊</div>
            <div style={{ fontWeight:600,color:'#6B7280' }}>Sélectionnez une date pour afficher le rapport</div>
          </div>
        )}
      </div>
    </>
  );
}
