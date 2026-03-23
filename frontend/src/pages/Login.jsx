import { useState } from "react";

export default function Login({ onLogin }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!selectedRole) return setError("Please select a role.");
    if (!username || !password) return setError("Please fill in all fields.");

    setLoading(true);
    setError("");

    // Phase 1: Simulated login (no auth backend yet)
    setTimeout(() => {
      setLoading(false);
      onLogin(selectedRole);
    }, 900);
  };

  return (
    <div className="page" style={{ alignItems: "center", justifyContent: "center", padding: "24px" }}>

      {/* Logo */}
      <div className="animate-in" style={{ textAlign: "center", marginBottom: "40px" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "10px",
          fontFamily: "var(--font-display)", fontSize: "1.5rem",
          fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "8px"
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: "10px",
            background: "var(--accent)", display: "flex",
            alignItems: "center", justifyContent: "center", fontSize: "1.1rem"
          }}>⛓</div>
          Pharma<span style={{ color: "var(--accent)" }}>Chain</span>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: 300 }}>
          Blockchain-powered medicine authentication
        </p>
      </div>

      {/* Login Card */}
      <div className="card animate-in" style={{
        width: "100%", maxWidth: "420px",
        animation: "fadeUp 0.45s ease 0.1s both"
      }}>

        <div style={{ marginBottom: "28px" }}>
          <h2 style={{
            fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: "1.4rem", letterSpacing: "-0.02em", marginBottom: "4px"
          }}>Welcome back</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: 300 }}>
            Sign in to continue
          </p>
        </div>

        {/* Role Selector */}
        <div style={{ marginBottom: "24px" }}>
          <p style={{
            fontSize: "0.75rem", fontFamily: "var(--font-mono)",
            color: "var(--text-secondary)", textTransform: "uppercase",
            letterSpacing: "0.08em", marginBottom: "10px"
          }}>Select your role</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {[
              { id: "manufacturer", label: "Manufacturer", icon: "🏭" },
              { id: "consumer",     label: "Consumer",     icon: "🔍" }
            ].map(r => (
              <button key={r.id} onClick={() => setSelectedRole(r.id)} style={{
                background: selectedRole === r.id ? "var(--accent-dim)" : "rgba(0,0,0,0.2)",
                border: `1px solid ${selectedRole === r.id ? "var(--accent)" : "var(--border)"}`,
                borderRadius: "var(--radius-sm)",
                padding: "14px 12px",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex", flexDirection: "column",
                alignItems: "center", gap: "6px"
              }}>
                <span style={{ fontSize: "1.4rem" }}>{r.icon}</span>
                <span style={{
                  fontFamily: "var(--font-display)", fontWeight: 600,
                  fontSize: "0.85rem",
                  color: selectedRole === r.id ? "var(--accent)" : "var(--text-secondary)"
                }}>{r.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "var(--danger-dim)", border: "1px solid rgba(255,77,109,0.2)",
            borderRadius: "var(--radius-sm)", padding: "10px 14px",
            color: "var(--danger)", fontSize: "0.83rem", marginBottom: "16px"
          }}>{error}</div>
        )}

        <button className="btn-primary" onClick={handleLogin} disabled={loading}>
          {loading ? <span className="spinner" /> : "Sign In →"}
        </button>

        <p style={{
          textAlign: "center", marginTop: "16px",
          fontSize: "0.75rem", color: "var(--text-muted)",
          fontFamily: "var(--font-mono)"
        }}>Phase 1 MVP · Auth is simulated</p>
      </div>

      {/* Grid background decoration */}
      <div style={{
        position: "fixed", inset: 0, zIndex: -1,
        backgroundImage: `
          linear-gradient(rgba(0,200,180,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,200,180,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px"
      }} />
    </div>
  );
}