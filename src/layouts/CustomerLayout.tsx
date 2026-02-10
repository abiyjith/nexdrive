import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useEffect, useState } from "react";
import "../styles/customer.css";

type Role = "customer" | "driver";

export default function CustomerLayout() {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState<Role>("customer");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login", { replace: true });
        return;
      }

      // Always trust DB over localStorage
      const { data: profile } = await supabase
        .from("profiles")
        .select("active_role")
        .eq("user_id", user.id)
        .single();

      const role = profile?.active_role;

      // 🚨 HARD BLOCKS
      if (role === "owner") {
        navigate("/owner/dashboard", { replace: true });
        return;
      }

      if (role === "admin") {
        navigate("/admin", { replace: true });
        return;
      }

      if (role === "driver") {
        setActiveRole("driver");
        localStorage.setItem("active_role", "driver");
      } else {
        setActiveRole("customer");
        localStorage.setItem("active_role", "customer");
      }

      setLoading(false);
    };

    initRole();
  }, [navigate]);

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  if (loading) return null; // prevents navbar flicker

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