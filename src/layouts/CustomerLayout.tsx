import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useEffect, useState } from "react";
import "../styles/customer.css";

export default function CustomerLayout() {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState<"customer" | "driver">("customer");

  useEffect(() => {
    const role = localStorage.getItem("active_role");

    // 🚨 HARD BLOCK: owner must never see customer layout
    if (role === "owner") {
      navigate("/owner/dashboard", { replace: true });
      return;
    }

    if (role === "driver") {
      setActiveRole("driver");
    } else {
      setActiveRole("customer");
    }
  }, [navigate]);

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="customer-root">
      <nav className="customer-navbar">
        <div className="nav-logo">P2P Rentals</div>

        <div className="nav-links">
          {activeRole === "customer" && (
            <>
              <NavLink to="/customer/home">Home</NavLink>
              <NavLink to="/customer/drivers">Drivers</NavLink>
              <NavLink to="/customer/vehicles">Vehicles</NavLink>
              <NavLink to="/customer/profile">Profile</NavLink>
              <NavLink to="/customer/dashboard">Dashboard</NavLink>
            </>
          )}

          {activeRole === "driver" && (
            <>
              <NavLink to="/customer/home">Home</NavLink>
              <NavLink to="/customer/driver-requests">Requests</NavLink>
              <NavLink to="/customer/profile">Profile</NavLink>
              <NavLink to="/customer/dashboard">Dashboard</NavLink>
            </>
          )}
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