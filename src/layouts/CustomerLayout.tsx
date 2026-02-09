import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "../styles/customer.css";

export default function CustomerLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="customer-root">
      <nav className="customer-navbar">
        <div className="nav-logo">P2P Rentals</div>

        <div className="nav-links">
          <NavLink to="/customer/home">Home</NavLink>
          <NavLink to="/customer/rentals">Rentals</NavLink>
          <NavLink to="/customer/drivers">Drivers</NavLink>
          <NavLink to="/customer/profile">Profile</NavLink>
          <NavLink to="/customer/dashboard">Dashboard</NavLink>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </nav>

      <main className="customer-content">
        <Outlet />
      </main>
    </div>
  );
}