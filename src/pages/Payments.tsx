import DashboardNavbar from "../components/DashboardNavbar";

export default function Payments() {
  return (
    <>
      <DashboardNavbar role="customer" />

      <div style={container}>
        <h1>Payments</h1>

        <div style={card}>
          <p style={muted}>No payment records available.</p>
        </div>

        <div style={summary}>
          <div style={summaryCard}>
            <h3>Total Paid</h3>
            <p>₹0</p>
          </div>

          <div style={summaryCard}>
            <h3>Pending</h3>
            <p>₹0</p>
          </div>
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

const summary = {
  display: "flex",
  gap: "20px",
  marginTop: "24px",
};

const summaryCard = {
  background: "#111",
  padding: "20px",
  borderRadius: "12px",
  flex: 1,
  textAlign: "center" as const,
};

const muted = {
  color: "#aaa",
};