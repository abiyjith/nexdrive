import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function YourVehicles() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  async function fetchVehicles() {
    const { data } = await supabase
      .from("vehicles")
      .select("*")
      .order("created_at", { ascending: false });

    setVehicles(data || []);
    setLoading(false);
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>Your Vehicles</h2>

      {vehicles.length === 0 && <p>No vehicles added</p>}

      {vehicles.map((v) => (
        <div key={v.id} style={{ border: "1px solid #ccc", padding: 10 }}>
          <b>{v.vehicle_type}</b> – {v.vehicle_number}
          <p>₹{v.price_per_day}/day</p>
          <p>{v.location_text}</p>

          <p>
            Status:
            {v.verification_status === "pending" && " 🟡 Pending"}
            {v.verification_status === "approved" && " 🟢 Approved"}
            {v.verification_status === "rejected" && " 🔴 Rejected"}
          </p>

          {v.rejection_reason && (
            <p style={{ color: "red" }}>{v.rejection_reason}</p>
          )}
        </div>
      ))}
    </div>
  );
}