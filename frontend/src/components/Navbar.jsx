export default function Navbar({ role, label, color, onLogout }) {
  return (
    <nav className="navbar">
      <div className="nav-logo">
        <div style={{
          width:30, height:30, borderRadius:"8px", background:"var(--accent)",
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.9rem"
        }}>⛓</div>
        Pharma<span>Chain</span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
        <span className="nav-badge" style={{ borderColor: color, color }}>
          {label}
        </span>
        <button className="btn-logout" onClick={onLogout}>Sign Out</button>
      </div>
    </nav>
  );
}