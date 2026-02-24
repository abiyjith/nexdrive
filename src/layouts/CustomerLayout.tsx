import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useEffect, useState } from "react";
import "../styles/customer.css";

export default function CustomerLayout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login", { replace: true });
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("active_role")
        .eq("user_id", user.id)
        .single();

      if (!profile) {
        navigate("/login", { replace: true });
        return;
      }

      // 🚨 HARD REDIRECTS — NO MIXING ROLES
      if (profile.active_role === "driver") {
        navigate("/driver/dashboard", { replace: true });
        return;
      }

      if (profile.active_role === "owner") {
        navigate("/owner/dashboard", { replace: true });
        return;
      }

      if (profile.active_role === "admin") {
        navigate("/admin", { replace: true });
        return;
      }

      // customer stays here
      setLoading(false);
    };

    init();
  }, [navigate]);

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  if (loading) return null;

  return (
    <div className="customer-root">
      <nav className="customer-navbar">
        <div className="nav-logo">P2P Rentals</div>

        <div className="nav-links">
          <NavLink to="/customer/home">Home</NavLink>
          <NavLink to="/customer/drivers">Drivers</NavLink>
          <NavLink to="/customer/vehicles">Vehicles</NavLink>
          <NavLink to="/customer/profile">Profile</NavLink>
          <NavLink to="/customer/dashboard">Dashboard</NavLink>
          <NavLink to="/customer/bookings">Bookings</NavLink>
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