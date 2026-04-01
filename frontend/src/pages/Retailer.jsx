import { useState } from "react";
import Navbar from "../components/Navbar";
import { API_BASE_URL } from "../config/api";

const API = API_BASE_URL;

export default function Retailer({ onLogout }) {
  const [verifyId,  setVerifyId]  = useState("");
  const [verifying, setVerifying] = useState(false);
  const [batch,     setBatch]     = useState(null);
  const [verifyErr, setVerifyErr] = useState("");

  const [historyId,      setHistoryId]      = useState("");
  const [historyLoading, setHistoryLoading] = useState(false);
  const [history,        setHistory]        = useState(null);
  const [historyError,   setHistoryError]   = useState("");

  const handleVerify = async () => {
    if (!verifyId.trim()) return;
    setVerifying(true); setVerifyErr(""); setBatch(null);
    try {
      const res  = await fetch(`${API}/batch/verify/${verifyId.trim()}`);
      const data = await res.json();
      if (!res.ok||!data.success) throw new Error(data.verdict||"Not found");
      setBatch(data);
    } catch(err) { setVerifyErr(err.message); }
    finally { setVerifying(false); }
  };

  const handleHistory = async () => {
    if (!historyId.trim()) return setHistoryError("Enter a Batch ID.");
    setHistoryLoading(true); setHistoryError(""); setHistory(null);
    try {
      const res  = await fetch(`${API}/batch/history/${historyId.trim()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||"Failed");
      setHistory(data);
    } catch(err) { setHistoryError(err.message); }
    finally { setHistoryLoading(false); }
  };

  const ROLE_COLORS = { Lab:"#a78bfa", Manufacturer:"#00c8b4", Distributor:"#60a5fa", Retailer:"#f59e0b" };
  const ROLE_ICONS  = { Lab:"🧪", Manufacturer:"🏭", Distributor:"🚚", Retailer:"🏪", None:"❓" };

  return (
    <div className="page">
      <Navbar role="retailer" label="Retailer" color="#f59e0b" onLogout={onLogout}/>
      <main style={{ flex:1, padding:"40px", maxWidth:"900px", margin:"0 auto", width:"100%", position:"relative", zIndex:1 }}>

        <div className="section-header animate-in">
          <h1>Retailer Dashboard</h1>
          <p>Verify batches received from distributors and check supply chain history.</p>
        </div>

        {/* Verify */}
        <div className="card animate-in" style={{ animation:"fadeUp 0.45s ease 0.1s both", marginBottom:"24px" }}>
          <h3 style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:"1rem", marginBottom:"6px" }}>Verify Batch</h3>
          <p style={{ color:"var(--text-secondary)", fontSize:"0.83rem", marginBottom:"20px", fontWeight:300 }}>Confirm authenticity before putting on shelf.</p>
          <div style={{ display:"flex", gap:"12px", alignItems:"flex-end" }}>
            <div className="form-group" style={{ flex:1 }}>
              <label>Batch ID</label>
              <input type="text" placeholder="e.g. BATCH001" value={verifyId}
                onChange={e=>{ setVerifyId(e.target.value); setVerifyErr(""); setBatch(null); }}
                onKeyDown={e=>e.key==="Enter"&&handleVerify()}/>
            </div>
            <button className="btn-primary" onClick={handleVerify} disabled={verifying||!verifyId.trim()}
              style={{ width:"auto", padding:"13px 24px", marginBottom:"1px", background:"#f59e0b", color:"#050a12" }}>
              {verifying ? <span className="spinner" style={{ borderTopColor:"#050a12" }}/> : "Verify"}
            </button>
          </div>
          {verifyErr && (
            <div style={{ background:"var(--danger-dim)", border:"1px solid rgba(255,77,109,0.2)", borderRadius:"var(--radius-sm)", padding:"10px 14px", color:"var(--danger)", fontSize:"0.83rem", marginTop:"12px" }}>❌ {verifyErr}</div>
          )}
          {batch && (
            <div style={{ marginTop:"16px", background:"var(--success-dim)", border:"1px solid rgba(0,229,160,0.2)", borderRadius:"var(--radius-sm)", padding:"16px" }}>
              <p style={{ color:"var(--success)", fontWeight:600, marginBottom:"12px" }}>✅ {batch.verdict}</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
                {[
                  { label:"Drug",         value: batch.drugName },
                  { label:"Drug ID",      value: batch.drugId },
                  { label:"Manufacturer", value: batch.manufacturerId },
                  { label:"Expiry",       value: batch.expiryDate },
                  { label:"Status",       value: batch.status },
                ].map(item=>(
                  <div key={item.label}>
                    <span style={{ fontSize:"0.7rem", fontFamily:"var(--font-mono)", color:"var(--text-muted)", textTransform:"uppercase", display:"block" }}>{item.label}</span>
                    <span style={{ fontSize:"0.85rem", color:"var(--text-primary)" }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Supply Chain History */}
        <div className="card animate-in" style={{ animation:"fadeUp 0.45s ease 0.2s both" }}>
          <h3 style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:"1rem", marginBottom:"6px" }}>View Supply Chain History</h3>
          <p style={{ color:"var(--text-secondary)", fontSize:"0.83rem", marginBottom:"20px", fontWeight:300 }}>See every step this batch took from lab to your shelf.</p>
          <div style={{ display:"flex", gap:"12px", alignItems:"flex-end" }}>
            <div className="form-group" style={{ flex:1 }}>
              <label>Batch ID</label>
              <input type="text" placeholder="e.g. BATCH001" value={historyId}
                onChange={e=>{ setHistoryId(e.target.value); setHistoryError(""); }}
                onKeyDown={e=>e.key==="Enter"&&handleHistory()}/>
            </div>
            <button className="btn-primary" onClick={handleHistory} disabled={historyLoading||!historyId.trim()}
              style={{ width:"auto", padding:"13px 24px", marginBottom:"1px", background:"#f59e0b", color:"#050a12" }}>
              {historyLoading ? <span className="spinner" style={{ borderTopColor:"#050a12" }}/> : "Fetch"}
            </button>
          </div>
          {historyError && (
            <div style={{ background:"var(--danger-dim)", border:"1px solid rgba(255,77,109,0.2)", borderRadius:"var(--radius-sm)", padding:"10px 14px", color:"var(--danger)", fontSize:"0.83rem", marginTop:"12px" }}>{historyError}</div>
          )}
          {history && (
            <div style={{ marginTop:"20px" }}>
              {history.history.map((ev, i) => {
                const color = ROLE_COLORS[ev.role] || "#888";
                const icon  = ROLE_ICONS[ev.role]  || "❓";
                const isLast = i === history.history.length - 1;
                return (
                  <div key={i} style={{ display:"flex", gap:"14px", position:"relative" }}>
                    {/* Line */}
                    {!isLast && (
                      <div style={{ position:"absolute", left:19, top:36, width:2, height:"calc(100% - 12px)", background:"var(--border)" }}/>
                    )}
                    {/* Icon */}
                    <div style={{
                      width:38, height:38, borderRadius:"50%", flexShrink:0,
                      background:`${color}20`, border:`2px solid ${color}`,
                      display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1rem", zIndex:1
                    }}>{icon}</div>
                    {/* Content */}
                    <div style={{ paddingBottom:"20px", flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"4px" }}>
                        <span style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:"0.9rem", color }}>{ev.action}</span>
                        <span style={{ fontSize:"0.72rem", fontFamily:"var(--font-mono)", color:"var(--text-muted)" }}>by {ev.by} · {ev.role}</span>
                      </div>
                      <span style={{ fontSize:"0.75rem", color:"var(--text-muted)", fontFamily:"var(--font-mono)" }}>{ev.timestamp}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}