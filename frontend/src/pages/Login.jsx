import { useState } from "react";

const ROLES = [
  { id: "lab",          label: "Research Lab",  icon: "🧪", color: "#a78bfa" },
  { id: "manufacturer", label: "Manufacturer",  icon: "🏭", color: "#00c8b4" },
  { id: "distributor",  label: "Distributor",   icon: "🚚", color: "#60a5fa" },
  { id: "retailer",     label: "Retailer",      icon: "🏪", color: "#f59e0b" },
  { id: "consumer",     label: "Consumer",      icon: "🔍", color: "#34d399" },
];

export default function Login({ onLogin }) {
  const [selected, setSelected] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const activeRole = ROLES.find(r => r.id === selected);

  const handleLogin = () => {
    if (!selected)           return setError("Please select a role.");
    if (!username||!password) return setError("Please fill in all fields.");
    setLoading(true); setError("");
    setTimeout(() => { setLoading(false); onLogin(selected); }, 800);
  };

  return (
    <div className="page" style={{ alignItems:"center", justifyContent:"center", padding:"24px" }}>

      {/* Grid bg */}
      <div style={{
        position:"fixed", inset:0, zIndex:-1,
        backgroundImage:`linear-gradient(rgba(0,200,180,0.03) 1px,transparent 1px),
                         linear-gradient(90deg,rgba(0,200,180,0.03) 1px,transparent 1px)`,
        backgroundSize:"40px 40px"
      }}/>

      {/* Logo */}
      <div className="animate-in" style={{ textAlign:"center", marginBottom:"36px" }}>
        <div style={{
          display:"inline-flex", alignItems:"center", gap:"10px",
          fontFamily:"var(--font-display)", fontSize:"1.6rem", fontWeight:800,
          letterSpacing:"-0.03em"
        }}>
          <div style={{
            width:42, height:42, borderRadius:"12px", background:"var(--accent)",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.2rem"
          }}>⛓</div>
          Pharma<span style={{color:"var(--accent)"}}>Chain</span>
        </div>
        <p style={{ color:"var(--text-secondary)", fontSize:"0.85rem", marginTop:"6px", fontWeight:300 }}>
          Phase 2 · Full Supply Chain Authentication
        </p>
      </div>

      {/* Card */}
      <div className="card animate-in" style={{
        width:"100%", maxWidth:"480px",
        animation:"fadeUp 0.45s ease 0.1s both"
      }}>
        <h2 style={{
          fontFamily:"var(--font-display)", fontWeight:700,
          fontSize:"1.3rem", letterSpacing:"-0.02em", marginBottom:"4px"
        }}>Select your role</h2>
        <p style={{ color:"var(--text-secondary)", fontSize:"0.83rem", marginBottom:"24px", fontWeight:300 }}>
          Each role has different permissions on the blockchain
        </p>

        {/* Role Grid */}
        <div style={{
          display:"grid", gridTemplateColumns:"1fr 1fr 1fr",
          gap:"10px", marginBottom:"24px"
        }}>
          {ROLES.map(r => (
            <button key={r.id} onClick={() => { setSelected(r.id); setError(""); }} style={{
              background: selected===r.id ? `${r.color}15` : "rgba(0,0,0,0.2)",
              border:`1px solid ${selected===r.id ? r.color : "var(--border)"}`,
              borderRadius:"var(--radius-sm)", padding:"14px 8px",
              cursor:"pointer", transition:"all 0.2s",
              display:"flex", flexDirection:"column", alignItems:"center", gap:"6px"
            }}>
              <span style={{ fontSize:"1.5rem" }}>{r.icon}</span>
              <span style={{
                fontFamily:"var(--font-display)", fontWeight:600, fontSize:"0.75rem",
                color: selected===r.id ? r.color : "var(--text-secondary)",
                textAlign:"center", lineHeight:1.2
              }}>{r.label}</span>
            </button>
          ))}
        </div>

        {/* Role description */}
        {activeRole && (
          <div style={{
            background:"var(--accent-dim)", border:"1px solid var(--border-bright)",
            borderRadius:"var(--radius-sm)", padding:"10px 14px",
            marginBottom:"20px", fontSize:"0.8rem", color:"var(--text-secondary)"
          }}>
            {selected==="lab"          && "🧪 Registers drug formulas on blockchain — origin of trust"}
            {selected==="manufacturer" && "🏭 Creates medicine batches linked to registered drugs"}
            {selected==="distributor"  && "🚚 Receives batches from manufacturer & forwards to retailers"}
            {selected==="retailer"     && "🏪 Receives batches from distributor & sells to consumers"}
            {selected==="consumer"     && "🔍 Verifies medicine authenticity & views full supply chain"}
          </div>
        )}

        {/* Inputs */}
        <div style={{ display:"flex", flexDirection:"column", gap:"14px", marginBottom:"18px" }}>
          <div className="form-group">
            <label>Username</label>
            <input type="text" placeholder="Enter username" value={username}
              onChange={e=>setUsername(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={password}
              onChange={e=>setPassword(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&handleLogin()} />
          </div>
        </div>

        {error && (
          <div style={{
            background:"var(--danger-dim)", border:"1px solid rgba(255,77,109,0.2)",
            borderRadius:"var(--radius-sm)", padding:"10px 14px",
            color:"var(--danger)", fontSize:"0.83rem", marginBottom:"16px"
          }}>{error}</div>
        )}

        <button className="btn-primary" onClick={handleLogin} disabled={loading}
          style={activeRole ? { background: activeRole.color } : {}}>
          {loading ? <span className="spinner"/> : "Sign In →"}
        </button>

        <p style={{
          textAlign:"center", marginTop:"14px", fontSize:"0.72rem",
          color:"var(--text-muted)", fontFamily:"var(--font-mono)"
        }}>Phase 2 MVP · Auth is simulated</p>
      </div>
    </div>
  );
}