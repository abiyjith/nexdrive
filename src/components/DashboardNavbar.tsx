import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function DashboardNavbar({ role }: { role: string }) {
  const navigate = useNavigate();

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      <b>P2P Rentals</b>
      <div style={styles.links}>
        <button onClick={() => navigate("/home")}>Home</button>
        <button onClick={() => navigate("/rentals")}>Rentals</button>
        <button onClick={() => navigate("/payments")}>Payments</button>
        <button onClick={() => navigate("/drivers")}>Drivers</button>
        <button onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 24px",
    background: "#FFD400",
  },
  links: { display: "flex", gap: 10 },
};