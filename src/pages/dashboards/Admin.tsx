import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function AdminLayout() {
  const navigate = useNavigate();

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div style={{ minHeight: "100vh", background: "black", color: "white" }}>
      <nav style={{
        display: "flex",
        gap: "20px",
        padding: "15px 30px",
        borderBottom: "2px solid yellow"
      }}>
        <NavLink to="requests">Requests</NavLink>
        <NavLink to="users">Users</NavLink>
        <NavLink to="drivers">Drivers</NavLink>
        <NavLink to="vehicles">Vehicles</NavLink>
        <NavLink to="/admin/reports">Reports</NavLink>
        <button onClick={logout} style={{ marginLeft: "auto" }}>
          Logout
        </button>
      </nav>

      <div style={{ padding: "30px" }}>
        <Outlet />
      </div>
    </div>
  );
}