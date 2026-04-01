import { useState } from "react";
import Login        from "./pages/Login";
import Lab          from "./pages/Lab";
import Manufacturer from "./pages/Manufacturer";
import Distributor  from "./pages/Distributor";
import Retailer     from "./pages/Retailer";
import Consumer     from "./pages/Consumer";
import "./index.css";

export default function App() {
  const [page, setPage] = useState("login");

  const handleLogin  = (role) => setPage(role);
  const handleLogout = ()     => setPage("login");

  return (
    <div className="app">
      {page === "login"        && <Login        onLogin={handleLogin} />}
      {page === "lab"          && <Lab          onLogout={handleLogout} />}
      {page === "manufacturer" && <Manufacturer onLogout={handleLogout} />}
      {page === "distributor"  && <Distributor  onLogout={handleLogout} />}
      {page === "retailer"     && <Retailer     onLogout={handleLogout} />}
      {page === "consumer"     && <Consumer     onLogout={handleLogout} />}
    </div>
  );
}