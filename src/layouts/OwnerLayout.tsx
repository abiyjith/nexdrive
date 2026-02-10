import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "../styles/customer.css";

export default function OwnerLayout() {
  const navigate = useNavigate();

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="customer-root">
      <nav className="customer-navbar">
        <div className="nav-logo">P2P Rentals (Owner)</div>

        <div className="nav-links">
          <NavLink to="/owner/dashboard">Dashboard</NavLink>
          <NavLink to="/owner/vehicles">Your Vehicles</NavLink>
          <NavLink to="/owner/add-vehicle">Add Vehicle</NavLink>
        </div>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </nav>

      <main className="customer-content">
        <Outlet />
      </main>
    </div>
  );
}