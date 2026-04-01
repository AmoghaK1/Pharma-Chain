import { useState } from "react";
import Navbar from "../components/Navbar";
import { API_BASE_URL } from "../config/api";

const API = API_BASE_URL;

export default function Manufacturer({ onLogout }) {
  const [form, setForm]       = useState({ batchId:"", drugId:"", expiryDate:"" });
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState("");
  const [transferBatchId, setTransferBatchId] = useState("");
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferResult,  setTransferResult]  = useState(null);
  const [transferError,   setTransferError]   = useState("");

  const handleChange = e => { setForm(p=>({...p,[e.target.name]:e.target.value})); setError(""); };

  const handleCreate = async () => {
    if (!form.batchId||!form.drugId||!form.expiryDate) return setError("All fields required.");
    setLoading(true); setError(""); setResult(null);
    try {
      const res  = await fetch(`${API}/batch/create`, {
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||"Failed");
      setResult(data); setForm({ batchId:"", drugId:"", expiryDate:"" });
    } catch(err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleTransfer = async () => {
    if (!transferBatchId.trim()) return setTransferError("Enter a Batch ID.");
    setTransferLoading(true); setTransferError(""); setTransferResult(null);
    try {
      const res  = await fetch(`${API}/batch/transfer`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ batchId: transferBatchId.trim(), transferTo:"distributor" })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||"Transfer failed");
      setTransferResult(data); setTransferBatchId("");
    } catch(err) { setTransferError(err.message); }
    finally { setTransferLoading(false); }
  };

  return (
    <div className="page">
      <Navbar role="manufacturer" label="Manufacturer" color="#00c8b4" onLogout={onLogout}/>
      <main style={{ flex:1, padding:"40px", maxWidth:"980px", margin:"0 auto", width:"100%", position:"relative", zIndex:1 }}>

        <div className="section-header animate-in">
          <h1>Manufacturer Dashboard</h1>
          <p>Create batches linked to registered drugs and transfer them to distributors.</p>
        </div>

        {/* Create Batch */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"24px", marginBottom:"24px" }}>
          <div className="card animate-in" style={{ animation:"fadeUp 0.45s ease 0.1s both" }}>
            <h3 style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:"1rem", marginBottom:"22px", color:"var(--text-secondary)" }}>
              Create New Batch
            </h3>
            <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
              <div className="form-group">
                <label>Batch ID</label>
                <input name="batchId" placeholder="e.g. BATCH001" value={form.batchId} onChange={handleChange}/>
              </div>
              <div className="form-group">
                <label>Drug ID <span style={{ color:"var(--accent)", fontSize:"0.7rem" }}>(must be registered by a lab)</span></label>
                <input name="drugId" placeholder="e.g. DRUG001" value={form.drugId} onChange={handleChange}/>
              </div>
              <div className="form-group">
                <label>Expiry Date</label>
                <input name="expiryDate" type="date" value={form.expiryDate} onChange={handleChange}/>
              </div>
            </div>
            {error && (
              <div style={{ background:"var(--danger-dim)", border:"1px solid rgba(255,77,109,0.2)", borderRadius:"var(--radius-sm)", padding:"10px 14px", color:"var(--danger)", fontSize:"0.83rem", marginTop:"16px" }}>{error}</div>
            )}
            <button className="btn-primary" onClick={handleCreate} disabled={loading} style={{ marginTop:"20px" }}>
              {loading ? <><span className="spinner"/>&nbsp;Writing to blockchain...</> : "Create Batch →"}
            </button>
          </div>

          {/* Result */}
          <div className="card animate-in" style={{
            animation:"fadeUp 0.45s ease 0.2s both",
            display:"flex", flexDirection:"column",
            alignItems:result?"stretch":"center", justifyContent:result?"flex-start":"center",
            minHeight:"280px"
          }}>
            {!result ? (
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:"2.5rem", marginBottom:"12px", opacity:0.3 }}>📦</div>
                <p style={{ color:"var(--text-muted)", fontSize:"0.85rem", fontWeight:300 }}>
                  Batch details and QR code<br/>appear here after creation
                </p>
              </div>
            ) : (
              <>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"16px" }}>
                  <h3 style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:"1rem" }}>Batch Created</h3>
                  <span className="tag tag-success">✅ On-chain</span>
                </div>
                <div style={{ background:"#fff", borderRadius:"var(--radius-sm)", padding:"10px", display:"flex", justifyContent:"center", marginBottom:"16px" }}>
                  <img src={result.qrCode} alt="QR" style={{ width:130, height:130 }}/>
                </div>
                <p style={{ textAlign:"center", fontSize:"0.72rem", color:"var(--text-muted)", fontFamily:"var(--font-mono)", marginBottom:"16px" }}>Scan to verify</p>
                <div className="divider"/>
                {[
                  { label:"Batch ID",   value:result.batchId },
                  { label:"Drug ID",    value:result.drugId },
                  { label:"Drug Name",  value:result.drugName },
                  { label:"Expiry",     value:result.expiryDate },
                  { label:"TX Hash",    value:result.transactionHash, mono:true }
                ].map(item=>(
                  <div key={item.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"10px", gap:"12px" }}>
                    <span style={{ fontSize:"0.72rem", fontFamily:"var(--font-mono)", color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.06em", whiteSpace:"nowrap", flexShrink:0 }}>{item.label}</span>
                    <span style={{ fontSize:item.mono?"0.7rem":"0.83rem", fontFamily:item.mono?"var(--font-mono)":"var(--font-body)", color:"var(--text-primary)", textAlign:"right", wordBreak:"break-all" }}>{item.value}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Transfer to Distributor */}
        <div className="card animate-in" style={{ animation:"fadeUp 0.45s ease 0.3s both" }}>
          <h3 style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:"1rem", marginBottom:"6px" }}>
            Transfer Batch to Distributor
          </h3>
          <p style={{ color:"var(--text-secondary)", fontSize:"0.83rem", marginBottom:"20px", fontWeight:300 }}>
            Hand off ownership to the distributor — recorded permanently on blockchain.
          </p>
          <div style={{ display:"flex", gap:"12px", alignItems:"flex-end" }}>
            <div className="form-group" style={{ flex:1 }}>
              <label>Batch ID to Transfer</label>
              <input type="text" placeholder="e.g. BATCH001" value={transferBatchId}
                onChange={e=>{ setTransferBatchId(e.target.value); setTransferError(""); }}/>
            </div>
            <button className="btn-primary" onClick={handleTransfer} disabled={transferLoading}
              style={{ width:"auto", padding:"13px 24px", marginBottom:"1px" }}>
              {transferLoading ? <span className="spinner"/> : "Transfer 🚚"}
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