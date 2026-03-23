import { useState } from "react";

const API = "http://localhost:5000/api/batch";

export default function Consumer({ onLogout }) {
  const [batchId, setBatchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleVerify = async () => {
    if (!batchId.trim()) return;
    setLoading(true);
    setResult(null);
    setSearched(false);

    try {
      const res = await fetch(`${API}/verify/${batchId.trim()}`);
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ success: false, verdict: "❌ Connection error — is the backend running?" });
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const handleReset = () => {
    setBatchId("");
    setResult(null);
    setSearched(false);
  };

  return (
    <div className="page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-logo">
          <div style={{
            width: 30, height: 30, borderRadius: "8px",
            background: "var(--accent)", display: "flex",
            alignItems: "center", justifyContent: "center", fontSize: "0.9rem"
          }}>⛓</div>
          Pharma<span>Chain</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className="nav-badge">Consumer</span>
          <button className="btn-logout" onClick={onLogout}>Sign Out</button>
        </div>
      </nav>

      <main style={{
        flex: 1, padding: "40px", maxWidth: "640px",
        margin: "0 auto", width: "100%", position: "relative", zIndex: 1
      }}>

        {/* Header */}
        <div className="section-header animate-in">
          <h1>Verify Medicine</h1>
          <p>Enter the batch ID found on your medicine to check authenticity.</p>
        </div>

        {/* Search Card */}
        <div className="card animate-in" style={{ animation: "fadeUp 0.45s ease 0.1s both", marginBottom: "24px" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Batch ID</label>
              <input
                type="text"
                placeholder="e.g. BATCH001"
                value={batchId}
                onChange={e => { setBatchId(e.target.value); setResult(null); setSearched(false); }}
                onKeyDown={e => e.key === "Enter" && handleVerify()}
                style={{ fontSize: "1rem" }}
              />
            </div>
            <button
              className="btn-primary"
              onClick={handleVerify}
              disabled={loading || !batchId.trim()}
              style={{ width: "auto", padding: "13px 24px", marginBottom: "1px" }}
            >
              {loading ? <span className="spinner" /> : "Verify"}
            </button>
          </div>

          <p style={{
            marginTop: "12px", fontSize: "0.75rem",
            color: "var(--text-muted)", fontFamily: "var(--font-mono)"
          }}>
            📱 Or scan the QR on the package — it opens the verify URL directly
          </p>
        </div>

        {/* Result */}
        {searched && result && (
          <div className="card animate-in" style={{
            borderColor: result.success ? "rgba(0,229,160,0.3)" : "rgba(255,77,109,0.3)",
            background: result.success
              ? "rgba(0,229,160,0.04)"
              : "rgba(255,77,109,0.04)"
          }}>

            {/* Verdict Header */}
            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between", marginBottom: "24px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{
                  width: 52, height: 52, borderRadius: "50%",
                  background: result.success ? "var(--success-dim)" : "var(--danger-dim)",
                  display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "1.5rem",
                  border: `1px solid ${result.success ? "rgba(0,229,160,0.3)" : "rgba(255,77,109,0.3)"}`
                }}>
                  {result.success ? "✅" : "❌"}
                </div>
                <div>
                  <h2 style={{
                    fontFamily: "var(--font-display)", fontWeight: 800,
                    fontSize: "1.3rem", letterSpacing: "-0.02em",
                    color: result.success ? "var(--success)" : "var(--danger)"
                  }}>
                    {result.success ? "AUTHENTIC" : "NOT FOUND"}
                  </h2>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                    {result.success
                      ? "This medicine is verified on the blockchain"
                      : "This batch was not found — possible counterfeit"}
                  </p>
                </div>
              </div>
              <span className={`tag ${result.success ? "tag-success" : "tag-danger"}`}>
                {result.success ? "Verified" : "Unverified"}
              </span>
            </div>

            {/* Batch Details (only if authentic) */}
            {result.success && (
              <>
                <div className="divider" />
                <div style={{ marginTop: "20px" }}>
                  <p style={{
                    fontSize: "0.72rem", fontFamily: "var(--font-mono)",
                    color: "var(--text-muted)", textTransform: "uppercase",
                    letterSpacing: "0.08em", marginBottom: "14px"
                  }}>Batch Information</p>

                  {[
                    { icon: "💊", label: "Drug Name",       value: result.drugName },
                    { icon: "🏭", label: "Manufacturer",    value: result.manufacturerId },
                    { icon: "📦", label: "Batch ID",        value: result.batchId },
                    { icon: "📅", label: "Expiry Date",     value: result.expiryDate },
                    { icon: "⏱",  label: "Registered At",   value: result.registeredAt },
                    { icon: "🔗", label: "TX Hash",         value: result.transactionHash, mono: true }
                  ].map(item => (
                    <div key={item.label} style={{
                      display: "flex", gap: "12px", alignItems: "flex-start",
                      padding: "10px 0",
                      borderBottom: "1px solid var(--border)"
                    }}>
                      <span style={{ fontSize: "1rem", flexShrink: 0, width: "22px" }}>{item.icon}</span>
                      <span style={{
                        fontSize: "0.75rem", fontFamily: "var(--font-mono)",
                        color: "var(--text-muted)", textTransform: "uppercase",
                        letterSpacing: "0.06em", width: "110px", flexShrink: 0, paddingTop: "2px"
                      }}>{item.label}</span>
                      <span style={{
                        fontSize: item.mono ? "0.7rem" : "0.88rem",
                        fontFamily: item.mono ? "var(--font-mono)" : "var(--font-body)",
                        color: "var(--text-primary)", wordBreak: "break-all"
                      }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Warning if fake */}
            {!result.success && (
              <div style={{
                padding: "14px 16px",
                background: "var(--danger-dim)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid rgba(255,77,109,0.2)"
              }}>
                <p style={{ fontSize: "0.83rem", color: "var(--danger)", lineHeight: 1.6 }}>
                  ⚠️ This batch ID was not found on the blockchain. Do <strong>not</strong> consume this medicine. Report it to the relevant authorities.
                </p>
              </div>
            )}

            <button
              onClick={handleReset}
              style={{
                marginTop: "20px", background: "transparent",
                border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
                padding: "10px 20px", color: "var(--text-secondary)",
                fontFamily: "var(--font-body)", fontSize: "0.85rem",
                cursor: "pointer", transition: "all 0.2s", width: "100%"
              }}
              onMouseOver={e => e.target.style.borderColor = "var(--accent)"}
              onMouseOut={e => e.target.style.borderColor = "var(--border)"}
            >
              ← Verify Another Batch
            </button>
          </div>
        )}

        {/* How it works */}
        {!searched && (
          <div className="card animate-in" style={{ animation: "fadeUp 0.45s ease 0.2s both" }}>
            <p style={{
              fontSize: "0.72rem", fontFamily: "var(--font-mono)",
              color: "var(--text-muted)", textTransform: "uppercase",
              letterSpacing: "0.08em", marginBottom: "16px"
            }}>How it works</p>
            {[
              { step: "01", text: "Find the Batch ID printed on your medicine packaging" },
              { step: "02", text: "Enter the ID above or scan the QR code with your phone" },
              { step: "03", text: "We check it against the blockchain in real time" },
              { step: "04", text: "Get instant authentic ✅ or counterfeit ❌ verdict" }
            ].map(item => (
              <div key={item.step} style={{
                display: "flex", gap: "14px", alignItems: "flex-start",
                marginBottom: "14px"
              }}>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: "0.72rem",
                  color: "var(--accent)", flexShrink: 0, paddingTop: "2px"
                }}>{item.step}</span>
                <span style={{ fontSize: "0.87rem", color: "var(--text-secondary)", fontWeight: 300 }}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}