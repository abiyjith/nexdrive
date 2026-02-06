import { useAuth } from "../../context/AuthContext";
import DashboardNavbar from "../../components/DashboardNavbar";
import { useNavigate } from "react-router-dom";

export default function CustomerDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  if (profile?.role !== "customer") {
    navigate(`/${profile?.role}`);
    return null;
  }

  return (
    <>
      <DashboardNavbar role="customer" />
      <div style={{ padding: 24 }}>
        <h2>Customer Dashboard</h2>
        <p>Email: {profile.email}</p>
        <p>Role: {profile.role}</p>
      </div>
    </>
  );
}