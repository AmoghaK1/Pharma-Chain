import { useState } from "react";
import Login from "./pages/Login";
import Manufacturer from "./pages/Manufacturer";
import Consumer from "./pages/Consumer";
import "./index.css";

export default function App() {
  const [page, setPage] = useState("login");
  const [role, setRole] = useState(null);

  const handleLogin = (selectedRole) => {
    setRole(selectedRole);
    setPage(selectedRole === "manufacturer" ? "manufacturer" : "consumer");
  };

  const handleLogout = () => {
    setRole(null);
    setPage("login");
  };

  return (
    <div className="app">
      {page === "login" && <Login onLogin={handleLogin} />}
      {page === "manufacturer" && <Manufacturer onLogout={handleLogout} />}
      {page === "consumer" && <Consumer onLogout={handleLogout} />}
    </div>
  );
}