import DashboardNavbar from "../components/DashboardNavbar";

export default function Rentals() {
  return (
    <>
      <DashboardNavbar role="customer" />

      <div style={container}>
        <h1>My Rentals</h1>

        <div style={card}>
          <p style={muted}>You have no active rentals.</p>
        </div>

        <div style={card}>
          <h3>Rental History</h3>
          <p style={muted}>No past rentals found.</p>
        </div>
      </div>
    </>
  );
}

const container = {
  padding: "32px",
  color: "#fff",
};

const card = {
  background: "#111",
  padding: "24px",
  borderRadius: "12px",
  marginTop: "20px",
};

const muted = {
  color: "#aaa",
};