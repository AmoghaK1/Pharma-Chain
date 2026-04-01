import { useState } from "react";
import Navbar from "../components/Navbar";

const API = "http://localhost:5000/api";

export default function Distributor({ onLogout }) {
  const [verifyId,  setVerifyId]  = useState("");
  const [verifying, setVerifying] = useState(false);
  const [batch,     setBatch]     = useState(null);
  const [verifyErr, setVerifyErr] = useState("");

  const [transferId,      setTransferId]      = useState("");
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferResult,  setTransferResult]  = useState(null);
  const [transferError,   setTransferError]   = useState("");

  const handleVerify = async () => {
    if (!verifyId.trim()) return;
    setVerifying(true); setVerifyErr(""); setBatch(null);
    try {
      const res  = await fetch(`${API}/batch/verify/${verifyId.trim()}`);
      const data = await res.json();
      if (!res.ok||!data.success) throw new Error(data.verdict||"Batch not found");
      setBatch(data);
    } catch(err) { setVerifyErr(err.message); }
    finally { setVerifying(false); }
  };

  const handleTransfer = async () => {
    if (!transferId.trim()) return setTransferError("Enter a Batch ID.");
    setTransferLoading(true); setTransferError(""); setTransferResult(null);
    try {
      const res  = await fetch(`${API}/batch/transfer`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ batchId: transferId.trim(), transferTo:"retailer" })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||"Transfer failed");
      setTransferResult(data); setTransferId("");
    } catch(err) { setTransferError(err.message); }
    finally { setTransferLoading(false); }
  };

  return (
    <div className="page">
      <Navbar role="distributor" label="Distributor" color="#60a5fa" onLogout={onLogout}/>
      <main style={{ flex:1, padding:"40px", maxWidth:"900px", margin:"0 auto", width:"100%", position:"relative", zIndex:1 }}>

        <div className="section-header animate-in">
          <h1>Distributor Dashboard</h1>
          <p>Verify incoming batches from manufacturers and forward them to retailers.</p>
        </div>

        {/* Verify Incoming Batch */}
        <div className="card animate-in" style={{ animation:"fadeUp 0.45s ease 0.1s both", marginBottom:"24px" }}>
          <h3 style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:"1rem", marginBottom:"6px" }}>
            Verify Incoming Batch
          </h3>
          <p style={{ color:"var(--text-secondary)", fontSize:"0.83rem", marginBottom:"20px", fontWeight:300 }}>
            Confirm a batch is authentic before accepting it.
          </p>
          <div style={{ display:"flex", gap:"12px", alignItems:"flex-end" }}>
            <div className="form-group" style={{ flex:1 }}>
              <label>Batch ID</label>
              <input type="text" placeholder="e.g. BATCH001" value={verifyId}
                onChange={e=>{ setVerifyId(e.target.value); setVerifyErr(""); setBatch(null); }}
                onKeyDown={e=>e.key==="Enter"&&handleVerify()}/>
            </div>
            <button className="btn-primary" onClick={handleVerify} disabled={verifying||!verifyId.trim()}
              style={{ width:"auto", padding:"13px 24px", marginBottom:"1px", background:"#60a5fa" }}>
              {verifying ? <span className="spinner"/> : "Verify"}
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
                  { label:"Manufacturer", value: batch.manufacturerId },
                  { label:"Expiry",       value: batch.expiryDate },
                  { label:"Status",       value: batch.status }
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

        {/* Transfer to Retailer */}
        <div className="card animate-in" style={{ animation:"fadeUp 0.45s ease 0.2s both" }}>
          <h3 style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:"1rem", marginBottom:"6px" }}>
            Transfer Batch to Retailer
          </h3>
          <p style={{ color:"var(--text-secondary)", fontSize:"0.83rem", marginBottom:"20px", fontWeight:300 }}>
            Forward ownership to retailer — recorded on blockchain.
          </p>
          <div style={{ display:"flex", gap:"12px", alignItems:"flex-end" }}>
            <div className="form-group" style={{ flex:1 }}>
              <label>Batch ID to Transfer</label>
              <input type="text" placeholder="e.g. BATCH001" value={transferId}
                onChange={e=>{ setTransferId(e.target.value); setTransferError(""); }}/>
            </div>
            <button className="btn-primary" onClick={handleTransfer} disabled={transferLoading}
              style={{ width:"auto", padding:"13px 24px", marginBottom:"1px", background:"#60a5fa" }}>
              {transferLoading ? <span className="spinner"/> : "Transfer 🏪"}
            </button>
          </div>
          {transferError && (
            <div style={{ background:"var(--danger-dim)", border:"1px solid rgba(255,77,109,0.2)", borderRadius:"var(--radius-sm)", padding:"10px 14px", color:"var(--danger)", fontSize:"0.83rem", marginTop:"12px" }}>{transferError}</div>
          )}
          {transferResult && (
            <div style={{ background:"var(--success-dim)", border:"1px solid rgba(0,229,160,0.2)", borderRadius:"var(--radius-sm)", padding:"12px 16px", marginTop:"12px" }}>
              <p style={{ color:"var(--success)", fontSize:"0.85rem" }}>✅ {transferResult.message}</p>
              <p className="mono" style={{ marginTop:"6px" }}>TX: {transferResult.transactionHash}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}