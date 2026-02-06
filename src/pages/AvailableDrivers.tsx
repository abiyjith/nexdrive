import { useEffect, useState } from "react";
import DashboardNavbar from "../components/DashboardNavbar";
import { supabase } from "../lib/supabase";

export default function AvailableDrivers() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    const { data } = await supabase
      .from("drivers")
      .select("*")
      .eq("available", true);

    setDrivers(data || []);
    setLoading(false);
  };

  return (
    <>
      <DashboardNavbar role="customer" />

      <div style={container}>
        <h1>Available Drivers</h1>

        {loading && <p style={muted}>Loading drivers...</p>}

        {!loading && drivers.length === 0 && (
          <div style={card}>
            <p style={muted}>No drivers available right now.</p>
          </div>
        )}

        <div style={grid}>
          {drivers.map((d) => (
            <div key={d.id} style={card}>
              <h3>{d.name}</h3>
              <p>Experience: {d.experience_years} years</p>
              <p>Price per day: ₹{d.price_per_day}</p>
              <p>Status: {d.available ? "Available" : "Unavailable"}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

const container = {
  padding: "32px",
  color: "#fff",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "24px",
  marginTop: "24px",
};

const card = {
  background: "#111",
  padding: "20px",
  borderRadius: "12px",
};

const muted = {
  color: "#aaa",
};