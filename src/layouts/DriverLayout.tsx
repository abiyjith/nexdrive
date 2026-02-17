import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useEffect, useState } from "react";
import "../styles/driver.css";

export default function DriverLayout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        navigate("/login", { replace: true });
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("active_role, is_driver, is_owner")
        .eq("user_id", data.user.id)
        .single();

      if (!profile || !profile.is_driver) {
        navigate("/customer/dashboard", { replace: true });
        return;
      }

      if (profile.active_role !== "driver") {
        navigate(`/${profile.active_role}/dashboard`, { replace: true });
        return;
      }

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
    <div className="driver-root">
      <nav className="driver-navbar">
        <div className="nav-logo">P2P Rentals</div>

        <div className="nav-links">
          <NavLink to="/driver/dashboard">Dashboard</NavLink>
          <NavLink to="/driver/profile">Profile</NavLink>
        </div>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </nav>

      <main className="driver-content">
        <Outlet />
      </main>
    </div>
  );
}