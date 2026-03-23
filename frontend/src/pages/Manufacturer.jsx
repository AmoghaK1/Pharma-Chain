import { useState } from "react";

const API = "http://localhost:5000/api/batch";

export default function Manufacturer({ onLogout }) {
  const [form, setForm] = useState({
    batchId: "", manufacturerId: "", drugName: "", expiryDate: ""
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleCreate = async () => {
    const { batchId, manufacturerId, drugName, expiryDate } = form;
    if (!batchId || !manufacturerId || !drugName || !expiryDate) {
      return setError("All fields are required.");
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`${API}/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create batch");
      setResult(data);
      setForm({ batchId: "", manufacturerId: "", drugName: "", expiryDate: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
          <span className="nav-badge">Manufacturer</span>
          <button className="btn-logout" onClick={onLogout}>Sign Out</button>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "40px", maxWidth: "900px", margin: "0 auto", width: "100%", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div className="section-header animate-in">
          <h1>Register New Batch</h1>
          <p>Create a batch and store it permanently on the blockchain.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

          {/* Form Card */}
          <div className="card animate-in" style={{ animation: "fadeUp 0.45s ease 0.1s both" }}>
            <h3 style={{
              fontFamily: "var(--font-display)", fontWeight: 700,
              fontSize: "1rem", marginBottom: "22px", color: "var(--text-secondary)"
            }}>Batch Details</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-group">
                <label>Batch ID</label>
                <input name="batchId" placeholder="e.g. BATCH001" value={form.batchId} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Manufacturer ID</label>
                <input name="manufacturerId" placeholder="e.g. MFR001" value={form.manufacturerId} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Drug Name</label>
                <input name="drugName" placeholder="e.g. Paracetamol 500mg" value={form.drugName} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Expiry Date</label>
                <input name="expiryDate" type="date" value={form.expiryDate} onChange={handleChange} />
              </div>
            </div>

            {error && (
              <div style={{
                background: "var(--danger-dim)", border: "1px solid rgba(255,77,109,0.2)",
                borderRadius: "var(--radius-sm)", padding: "10px 14px",
                color: "var(--danger)", fontSize: "0.83rem", marginTop: "16px"
              }}>{error}</div>
            )}

            <button
              className="btn-primary"
              onClick={handleCreate}
              disabled={loading}
              style={{ marginTop: "20px" }}
            >
              {loading ? <><span className="spinner" /> &nbsp;Writing to blockchain...</> : "Register Batch on Blockchain →"}
            </button>
          </div>

          {/* Result Card */}
          <div className="card animate-in" style={{
            animation: "fadeUp 0.45s ease 0.2s both",
            display: "flex", flexDirection: "column",
            alignItems: result ? "stretch" : "center",
            justifyContent: result ? "flex-start" : "center",
            minHeight: "300px"
          }}>
            {!result ? (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "12px", opacity: 0.3 }}>🔗</div>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 300 }}>
                  Batch details and QR code will<br />appear here after registration
                </p>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                  <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem" }}>
                    Batch Registered
                  </h3>
                  <span className="tag tag-success">✅ On-chain</span>
                </div>

                {/* QR Code */}
                <div style={{
                  background: "#fff", borderRadius: "var(--radius-sm)",
                  padding: "12px", display: "flex",
                  justifyContent: "center", marginBottom: "20px"
                }}>
                  <img
                    src={result.qrCode}
                    alt="QR Code"
                    style={{ width: 150, height: 150 }}
                  />
                </div>
                <p style={{
                  textAlign: "center", fontSize: "0.75rem",
                  color: "var(--text-muted)", fontFamily: "var(--font-mono)",
                  marginBottom: "20px"
                }}>Scan to verify authenticity</p>

                <div className="divider" />

                {/* Details */}
                {[
                  { label: "Batch ID",     value: result.batchId },
                  { label: "Drug Name",    value: result.drugName },
                  { label: "Expiry Date",  value: result.expiryDate },
                  { label: "TX Hash",      value: result.transactionHash, mono: true }
                ].map(item => (
                  <div key={item.label} style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "flex-start", marginBottom: "12px", gap: "12px"
                  }}>
                    <span style={{
                      fontSize: "0.75rem", fontFamily: "var(--font-mono)",
                      color: "var(--text-muted)", textTransform: "uppercase",
                      letterSpacing: "0.06em", whiteSpace: "nowrap", flexShrink: 0
                    }}>{item.label}</span>
                    <span style={{
                      fontSize: item.mono ? "0.7rem" : "0.85rem",
                      fontFamily: item.mono ? "var(--font-mono)" : "var(--font-body)",
                      color: "var(--text-primary)", textAlign: "right",
                      wordBreak: "break-all"
                    }}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Info Banner */}
        <div style={{
          marginTop: "24px", padding: "16px 20px",
          background: "var(--accent-dim)", border: "1px solid var(--border-bright)",
          borderRadius: "var(--radius)", display: "flex", gap: "12px",
          alignItems: "flex-start"
        }}>
          <span style={{ fontSize: "1rem", flexShrink: 0 }}>🛡️</span>
          <p style={{ fontSize: "0.83rem", color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.6 }}>
            Once registered, batch data is <strong style={{ color: "var(--accent)", fontWeight: 500 }}>permanently stored on the blockchain</strong> and cannot be modified or deleted. The QR code links directly to on-chain verification.
          </p>
        </div>
      </main>
    </div>
  );
}