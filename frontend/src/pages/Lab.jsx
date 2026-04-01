import { useState } from "react";
import Navbar from "../components/Navbar";

const API = "http://localhost:5000/api";

export default function Lab({ onLogout }) {
  const [form, setForm]     = useState({ drugId:"", drugName:"", compositionHash:"" });
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState("");

  const handleChange = e => { setForm(p=>({...p,[e.target.name]:e.target.value})); setError(""); };

  const handleRegister = async () => {
    if (!form.drugId||!form.drugName||!form.compositionHash)
      return setError("All fields are required.");
    setLoading(true); setError(""); setResult(null);
    try {
      const res  = await fetch(`${API}/drug/register`, {
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||"Failed");
      setResult(data);
      setForm({ drugId:"", drugName:"", compositionHash:"" });
    } catch(err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="page">
      <Navbar role="lab" label="Research Lab" color="#a78bfa" onLogout={onLogout}/>
      <main style={{ flex:1, padding:"40px", maxWidth:"900px", margin:"0 auto", width:"100%", position:"relative", zIndex:1 }}>

        <div className="section-header animate-in">
          <h1>Register Drug Formula</h1>
          <p>Register a new drug on the blockchain. Manufacturers can only create batches linked to registered drugs.</p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"24px" }}>

          {/* Form */}
          <div className="card animate-in" style={{ animation:"fadeUp 0.45s ease 0.1s both" }}>
            <h3 style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:"1rem", marginBottom:"22px", color:"var(--text-secondary)" }}>
              Drug Details
            </h3>
            <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
              <div className="form-group">
                <label>Drug ID</label>
                <input name="drugId" placeholder="e.g. DRUG001" value={form.drugId} onChange={handleChange}/>
              </div>
              <div className="form-group">
                <label>Drug Name</label>
                <input name="drugName" placeholder="e.g. Paracetamol 500mg" value={form.drugName} onChange={handleChange}/>
              </div>
              <div className="form-group">
                <label>Composition Hash</label>
                <input name="compositionHash" placeholder="e.g. sha256 of formula" value={form.compositionHash} onChange={handleChange}/>
              </div>
            </div>

            {error && (
              <div style={{
                background:"var(--danger-dim)", border:"1px solid rgba(255,77,109,0.2)",
                borderRadius:"var(--radius-sm)", padding:"10px 14px",
                color:"var(--danger)", fontSize:"0.83rem", marginTop:"16px"
              }}>{error}</div>
            )}

            <button className="btn-primary" onClick={handleRegister} disabled={loading}
              style={{ marginTop:"20px", background: loading?"":"#a78bfa" }}>
              {loading ? <><span className="spinner"/>&nbsp; Registering on blockchain...</> : "Register Drug →"}
            </button>
          </div>

          {/* Result */}
          <div className="card animate-in" style={{
            animation:"fadeUp 0.45s ease 0.2s both",
            display:"flex", flexDirection:"column",
            alignItems: result?"stretch":"center", justifyContent: result?"flex-start":"center",
            minHeight:"280px"
          }}>
            {!result ? (
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:"2.5rem", marginBottom:"12px", opacity:0.3 }}>🧪</div>
                <p style={{ color:"var(--text-muted)", fontSize:"0.85rem", fontWeight:300 }}>
                  Drug details will appear<br/>here after registration
                </p>
              </div>
            ) : (
              <>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px" }}>
                  <h3 style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:"1rem" }}>Drug Registered</h3>
                  <span className="tag" style={{ background:"rgba(167,139,250,0.1)", color:"#a78bfa", border:"1px solid rgba(167,139,250,0.3)" }}>✅ On-chain</span>
                </div>
                {[
                  { label:"Drug ID",           value: result.drugId },
                  { label:"Drug Name",         value: result.drugName },
                  { label:"Composition Hash",  value: result.compositionHash, mono:true },
                  { label:"TX Hash",           value: result.transactionHash,  mono:true }
                ].map(item=>(
                  <div key={item.label} style={{
                    display:"flex", justifyContent:"space-between", alignItems:"flex-start",
                    marginBottom:"12px", gap:"12px"
                  }}>
                    <span style={{ fontSize:"0.72rem", fontFamily:"var(--font-mono)", color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.06em", whiteSpace:"nowrap", flexShrink:0 }}>{item.label}</span>
                    <span style={{ fontSize:item.mono?"0.7rem":"0.85rem", fontFamily:item.mono?"var(--font-mono)":"var(--font-body)", color:"var(--text-primary)", textAlign:"right", wordBreak:"break-all" }}>{item.value}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Info */}
        <div style={{
          marginTop:"24px", padding:"16px 20px",
          background:"rgba(167,139,250,0.07)", border:"1px solid rgba(167,139,250,0.25)",
          borderRadius:"var(--radius)", display:"flex", gap:"12px", alignItems:"flex-start"
        }}>
          <span style={{ fontSize:"1rem", flexShrink:0 }}>🔬</span>
          <p style={{ fontSize:"0.83rem", color:"var(--text-secondary)", fontWeight:300, lineHeight:1.6 }}>
            You are the <strong style={{ color:"#a78bfa", fontWeight:500 }}>origin of trust</strong> in this supply chain. No manufacturer can produce a batch without a valid Drug ID registered by a verified lab.
          </p>
        </div>
      </main>
    </div>
  );
}