import DashboardNavbar from "../../components/DashboardNavbar";

export default function OwnerDashboard() {
  return (
    <>
      <DashboardNavbar role="owner" />
      <div style={{ padding: 24 }}>
        <h2>Owner Dashboard</h2>
        <p>Manage vehicles & bookings</p>
      </div>
    </>
  );
}