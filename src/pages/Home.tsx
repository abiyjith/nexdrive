import DashboardNavbar from "../components/DashboardNavbar";

export default function Home() {
  return (
    <>
      <DashboardNavbar role="customer" />

      <div style={container}>
        <h1>Welcome to P2P Rentals</h1>
        <p style={subtitle}>
          Rent vehicles, book drivers, and manage rentals easily.
        </p>

        <div style={grid}>
          <div style={card}>
            <h3>🚗 Rent Vehicles</h3>
            <p>Choose from verified vehicles at affordable prices.</p>
          </div>

          <div style={card}>
            <h3>👨‍✈️ Hire Drivers</h3>
            <p>Book experienced drivers when you need them.</p>
          </div>

          <div style={card}>
            <h3>💳 Secure Payments</h3>
            <p>Transparent pricing and secure payment system.</p>
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

const subtitle = {
  color: "#aaa",
  marginBottom: "32px",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "24px",
};

const card = {
  background: "#111",
  padding: "24px",
  borderRadius: "12px",
  boxShadow: "0 0 20px rgba(0,0,0,0.6)",
};