import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import { Html5Qrcode } from "html5-qrcode";

const API = "http://localhost:5000/api";

const STEPS = [
  { role:"Lab",          icon:"🧪", color:"#a78bfa", label:"Research Lab"  },
  { role:"Manufacturer", icon:"🏭", color:"#00c8b4", label:"Manufacturer"  },
  { role:"Distributor",  icon:"🚚", color:"#60a5fa", label:"Distributor"   },
  { role:"Retailer",     icon:"🏪", color:"#f59e0b", label:"Retailer"      },
  { role:"Consumer",     icon:"🙋", color:"#34d399", label:"You"           },
];

export default function Consumer({ onLogout }) {
  const [tab,      setTab]      = useState("manual"); // "manual" | "scan"
  const [batchId,  setBatchId]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null);
  const [history,  setHistory]  = useState(null);
  const [searched, setSearched] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanError,setScanError]= useState("");

  const scannerRef   = useRef(null);
  const scannerDivId = "qr-reader";

  const startScanner = async () => {
    setScanError("");
    setScanning(true);
    try {
      const qr = new Html5Qrcode(scannerDivId);
      scannerRef.current = qr;
      await qr.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        async (decodedText) => {
          const parts = decodedText.split("/");
          const id    = parts[parts.length - 1];
          await stopScanner();
          setBatchId(id);
          setTab("manual");
          await runVerify(id);
        },
        () => {}
      );
    } catch (err) {
      setScanning(false);
      setScanError("Camera access denied or not available. Use manual entry instead.");
    }
  };

  const stopScanner = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        scannerRef.current = null;
      }
    } catch {}
    setScanning(false);
  };

  useEffect(() => { if (tab !== "scan") stopScanner(); }, [tab]);
  useEffect(() => () => { stopScanner(); }, []);

  const runVerify = async (id) => {
    const targetId = (id || batchId).trim();
    if (!targetId) return;
    setLoading(true); setResult(null); setHistory(null); setSearched(false);
    try {
      const [verRes, histRes] = await Promise.all([
        fetch(`${API}/batch/verify/${targetId}`),
        fetch(`${API}/batch/history/${targetId}`)
      ]);
      const verData  = await verRes.json();
      const histData = histRes.ok ? await histRes.json() : null;
      setResult(verData);
      if (histData?.success) setHistory(histData.history);
    } catch {
      setResult({ success:false, verdict:"Connection error — is the backend running?" });
    } finally { setLoading(false); setSearched(true); }
  };

  const handleReset = () => {
    setBatchId(""); setResult(null); setHistory(null); setSearched(false); setScanError("");
  };

  const completedRoles = new Set((history||[]).map(h => h.role));
  const getStepStatus  = (role) => {
    if (role === "Lab") return result?.success ? "complete" : "pending";
    if (role === "Consumer") return result?.success ? "complete" : "pending";
    return completedRoles.has(role) ? "complete" : "pending";
  };

  return (
    <div className="page">
      <Navbar role="consumer" label="Consumer" color="#34d399" onLogout={onLogout}/>
      <main style={{ flex:1, padding:"40px", maxWidth:"700px", margin:"0 auto", width:"100%", position:"relative", zIndex:1 }}>

        <div className="section-header animate-in">
          <h1>Verify Medicine</h1>
          <p>Scan the QR on the package or enter the Batch ID manually.</p>
        </div>

        {/* Input Card — hidden after search */}
        {!searched && (
          <div className="card animate-in" style={{ animation:"fadeUp 0.45s ease 0.1s both", marginBottom:"24px" }}>

            {/* Tabs */}
            <div style={{
              display:"flex", marginBottom:"24px",
              background:"rgba(0,0,0,0.3)", borderRadius:"var(--radius-sm)", padding:"4px"
            }}>
              {[
                { id:"manual", icon:"⌨️", label:"Enter Batch ID" },
                { id:"scan",   icon:"📷", label:"Scan QR Code"   }
              ].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} style={{
                  flex:1, padding:"10px", border:"none",
                  borderRadius:"calc(var(--radius-sm) - 2px)",
                  background: tab===t.id ? "var(--bg-card)" : "transparent",
                  color: tab===t.id ? "var(--accent)" : "var(--text-muted)",
                  fontFamily:"var(--font-display)", fontWeight:600, fontSize:"0.85rem",
                  cursor:"pointer", transition:"all 0.2s",
                  boxShadow: tab===t.id ? "0 2px 8px rgba(0,0,0,0.3)" : "none",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:"6px"
                }}>
                  <span>{t.icon}</span>{t.label}
                </button>
              ))}
            </div>

            {/* Manual */}
            {tab === "manual" && (
              <div style={{ display:"flex", gap:"12px", alignItems:"flex-end" }}>
                <div className="form-group" style={{ flex:1 }}>
                  <label>Batch ID</label>
                  <input type="text" placeholder="e.g. BATCH001" value={batchId}
                    onChange={e => setBatchId(e.target.value)}
                    onKeyDown={e => e.key==="Enter" && runVerify()}/>
                </div>
                <button className="btn-primary" onClick={() => runVerify()}
                  disabled={loading||!batchId.trim()}
                  style={{ width:"auto", padding:"13px 24px", marginBottom:"1px", background:"#34d399" }}>
                  {loading ? <span className="spinner" style={{ borderTopColor:"#050a12" }}/> : "Verify"}
                </button>
              </div>
            )}

            {/* QR Scanner */}
            {tab === "scan" && (
              <div>
                <div style={{
                  borderRadius:"var(--radius)", overflow:"hidden",
                  border:"2px solid var(--border-bright)", background:"#000",
                  position:"relative", minHeight: scanning ? "320px" : "200px",
                  display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center"
                }}>
                  <div id={scannerDivId} style={{ width:"100%" }}/>

                  {!scanning && (
                    <div style={{ textAlign:"center", padding:"32px", position:"absolute" }}>
                      <div style={{ fontSize:"3rem", marginBottom:"12px", opacity:0.4 }}>📷</div>
                      <p style={{ color:"var(--text-secondary)", fontSize:"0.85rem", fontWeight:300, marginBottom:"20px" }}>
                        Camera will open to scan<br/>the QR code on your medicine
                      </p>
                      <button className="btn-primary" onClick={startScanner}
                        style={{ width:"auto", padding:"12px 28px", background:"#34d399" }}>
                        Start Camera →
                      </button>
                    </div>
                  )}

                  {scanning && (
                    <>
                      {/* Corner decorators */}
                      {[
                        { top:8,    left:8,  borderTop:"3px solid #34d399",    borderLeft:"3px solid #34d399"  },
                        { top:8,    right:8, borderTop:"3px solid #34d399",    borderRight:"3px solid #34d399" },
                        { bottom:8, left:8,  borderBottom:"3px solid #34d399", borderLeft:"3px solid #34d399"  },
                        { bottom:8, right:8, borderBottom:"3px solid #34d399", borderRight:"3px solid #34d399" },
                      ].map((s,i) => (
                        <div key={i} style={{ position:"absolute", width:24, height:24, ...s, zIndex:10 }}/>
                      ))}
                      <div style={{
                        position:"absolute", bottom:12, left:"50%", transform:"translateX(-50%)",
                        background:"rgba(0,0,0,0.7)", borderRadius:"20px", padding:"6px 16px", zIndex:10
                      }}>
                        <span style={{ fontSize:"0.75rem", color:"#34d399", fontFamily:"var(--font-mono)" }}>scanning...</span>
                      </div>
                    </>
                  )}
                </div>

                {scanning && (
                  <button onClick={stopScanner} style={{
                    marginTop:"12px", width:"100%", background:"transparent",
                    border:"1px solid var(--danger)", borderRadius:"var(--radius-sm)",
                    padding:"10px", color:"var(--danger)",
                    fontFamily:"var(--font-body)", fontSize:"0.85rem", cursor:"pointer"
                  }}>Stop Camera</button>
                )}

                {scanError && (
                  <div style={{
                    marginTop:"12px", background:"var(--danger-dim)",
                    border:"1px solid rgba(255,77,109,0.2)", borderRadius:"var(--radius-sm)",
                    padding:"10px 14px", color:"var(--danger)", fontSize:"0.83rem"
                  }}>{scanError}</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Verdict */}
        {searched && result && (
          <div className="card animate-in" style={{
            marginBottom:"24px",
            borderColor: result.success ? "rgba(0,229,160,0.3)" : "rgba(255,77,109,0.3)",
            background:  result.success ? "rgba(0,229,160,0.04)" : "rgba(255,77,109,0.04)"
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
              <div style={{
                width:56, height:56, borderRadius:"50%", flexShrink:0,
                background: result.success ? "var(--success-dim)" : "var(--danger-dim)",
                border:`2px solid ${result.success ? "rgba(0,229,160,0.4)" : "rgba(255,77,109,0.4)"}`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.6rem"
              }}>
                {result.success ? "✅" : "❌"}
              </div>
              <div style={{ flex:1 }}>
                <h2 style={{
                  fontFamily:"var(--font-display)", fontWeight:800, fontSize:"1.4rem",
                  letterSpacing:"-0.02em",
                  color: result.success ? "var(--success)" : "var(--danger)"
                }}>
                  {result.success ? "AUTHENTIC" : "NOT FOUND"}
                </h2>
                <p style={{ fontSize:"0.83rem", color:"var(--text-secondary)", marginTop:"2px" }}>
                  {result.success
                    ? `${result.drugName} · Expires ${result.expiryDate} · ${result.status}`
                    : "Batch not found on blockchain — possible counterfeit"}
                </p>
              </div>
            </div>

            {result.success && (
              <>
                <div className="divider" style={{ margin:"20px 0" }}/>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
                  {[
                    { label:"Batch ID",     value: result.batchId },
                    { label:"Drug ID",      value: result.drugId },
                    { label:"Manufacturer", value: result.manufacturerId },
                    { label:"Expiry",       value: result.expiryDate },
                    { label:"TX Hash",      value: result.transactionHash, mono:true, full:true }
                  ].map(item=>(
                    <div key={item.label} style={{ gridColumn:item.full?"1/-1":"auto" }}>
                      <span style={{ fontSize:"0.7rem", fontFamily:"var(--font-mono)", color:"var(--text-muted)", textTransform:"uppercase", display:"block", marginBottom:"3px" }}>{item.label}</span>
                      <span style={{ fontSize:item.mono?"0.72rem":"0.85rem", fontFamily:item.mono?"var(--font-mono)":"var(--font-body)", color:"var(--text-primary)", wordBreak:"break-all" }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {!result.success && (
              <div style={{ marginTop:"16px", padding:"12px 14px", background:"var(--danger-dim)", border:"1px solid rgba(255,77,109,0.2)", borderRadius:"var(--radius-sm)" }}>
                <p style={{ fontSize:"0.83rem", color:"var(--danger)", lineHeight:1.6 }}>
                  ⚠️ Do <strong>not</strong> consume this medicine. Report to health authorities immediately.
                </p>
              </div>
            )}

            <button onClick={handleReset} style={{
              marginTop:"16px", background:"transparent", width:"100%",
              border:"1px solid var(--border)", borderRadius:"var(--radius-sm)",
              padding:"10px", color:"var(--text-secondary)",
              fontFamily:"var(--font-body)", fontSize:"0.85rem", cursor:"pointer"
            }}>
              ← Verify Another Batch
            </button>
          </div>
        )}

        {/* Visual Timeline */}
        {searched && result?.success && (
          <div className="card animate-in" style={{ animation:"fadeUp 0.45s ease 0.15s both" }}>
            <h3 style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:"1rem", marginBottom:"6px" }}>
              Supply Chain Journey
            </h3>
            <p style={{ color:"var(--text-secondary)", fontSize:"0.83rem", marginBottom:"28px", fontWeight:300 }}>
              Every step verified on blockchain.
            </p>
            <div style={{ position:"relative" }}>
              <div style={{ position:"absolute", top:22, left:22, width:"calc(100% - 44px)", height:2, background:"var(--border)", zIndex:0 }}/>
              <div style={{
                position:"absolute", top:22, left:22,
                width:`${(completedRoles.size / (STEPS.length-1)) * 100}%`, height:2,
                background:"linear-gradient(90deg,#a78bfa,#00c8b4,#60a5fa,#f59e0b,#34d399)",
                zIndex:1, transition:"width 1s ease"
              }}/>
              <div style={{ display:"flex", justifyContent:"space-between", position:"relative", zIndex:2 }}>
                {STEPS.map(step => {
                  const done = getStepStatus(step.role) === "complete";
                  const ev   = (history||[]).find(h=>h.role===step.role);
                  return (
                    <div key={step.role} style={{ display:"flex", flexDirection:"column", alignItems:"center", width:`${100/STEPS.length}%`, gap:"8px" }}>
                      <div style={{
                        width:44, height:44, borderRadius:"50%",
                        background: done ? `${step.color}25` : "var(--bg-card)",
                        border:`2px solid ${done ? step.color : "var(--border)"}`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:"1.2rem", transition:"all 0.4s ease",
                        boxShadow: done ? `0 0 12px ${step.color}40` : "none"
                      }}>
                        {done ? step.icon : <span style={{ opacity:0.3 }}>{step.icon}</span>}
                      </div>
                      <div style={{ textAlign:"center" }}>
                        <p style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:"0.72rem", color: done ? step.color : "var(--text-muted)" }}>{step.label}</p>
                        <p style={{ fontSize:"0.62rem", color:"var(--text-muted)", fontFamily:"var(--font-mono)" }}>
                          {ev ? ev.by : step.role==="Consumer"&&done ? "verified now" : "—"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {history?.length > 0 && (
              <>
                <div className="divider" style={{ margin:"28px 0 20px" }}/>
                <p style={{ fontSize:"0.72rem", fontFamily:"var(--font-mono)", color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"16px" }}>Detailed Events</p>
                {history.map((ev,i) => {
                  const step   = STEPS.find(s=>s.role===ev.role)||{color:"#888",icon:"❓"};
                  const isLast = i===history.length-1;
                  return (
                    <div key={i} style={{ display:"flex", gap:"14px", position:"relative" }}>
                      {!isLast && <div style={{ position:"absolute", left:15, top:32, width:2, height:"calc(100% - 8px)", background:"var(--border)" }}/>}
                      <div style={{ width:30, height:30, borderRadius:"50%", flexShrink:0, background:`${step.color}20`, border:`1px solid ${step.color}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.8rem", zIndex:1 }}>{step.icon}</div>
                      <div style={{ paddingBottom:"18px", flex:1 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap" }}>
                          <span style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:"0.85rem", color:step.color }}>{ev.action}</span>
                          <span style={{ fontSize:"0.72rem", fontFamily:"var(--font-mono)", color:"var(--text-secondary)" }}>by {ev.by} ({ev.role})</span>
                        </div>
                        <span style={{ fontSize:"0.72rem", color:"var(--text-muted)", fontFamily:"var(--font-mono)" }}>{ev.timestamp}</span>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* How it works */}
        {!searched && (
          <div className="card animate-in" style={{ animation:"fadeUp 0.45s ease 0.2s both" }}>
            <p style={{ fontSize:"0.72rem", fontFamily:"var(--font-mono)", color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"16px" }}>How it works</p>
            {[
              { n:"01", t:"Scan the QR code on the medicine OR type the Batch ID" },
              { n:"02", t:"We query the blockchain in real time" },
              { n:"03", t:"See the full journey: Lab → Manufacturer → Distributor → Retailer" },
              { n:"04", t:"Every step is timestamped and tamper-proof on-chain" },
            ].map(item=>(
              <div key={item.n} style={{ display:"flex", gap:"14px", alignItems:"flex-start", marginBottom:"14px" }}>
                <span style={{ fontFamily:"var(--font-mono)", fontSize:"0.72rem", color:"var(--accent)", flexShrink:0, paddingTop:"2px" }}>{item.n}</span>
                <span style={{ fontSize:"0.87rem", color:"var(--text-secondary)", fontWeight:300 }}>{item.t}</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}