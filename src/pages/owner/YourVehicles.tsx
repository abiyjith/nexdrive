import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function YourVehicles() {
  const [vehicles, setVehicles] = useState<any[]>([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;

    const { data } = await supabase
      .from("vehicles")
      .select(`
        id, brand, model, is_active,
        vehicle_bookings (
          id, start_date, end_date, status, payment_status,
          profiles ( first_name, phone )
        )
      `)
      .eq("owner_id", auth.user.id)
      .order("created_at", { foreignTable: "vehicle_bookings", ascending: false });

    setVehicles(data || []);
  };

  const confirmPayment = async (bookingId: string, vehicleId: string) => {
    await supabase
      .from("vehicle_bookings")
      .update({ payment_status: "confirmed", status: "confirmed" })
      .eq("id", bookingId);

    await supabase
      .from("vehicles")
      .update({ is_active: true })
      .eq("id", vehicleId);

    load();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ color: "#facc15" }}>Your Vehicles</h2>

      {vehicles.map((v) => (
        <div key={v.id} className="vehicle-card">
          <h3>{v.brand} {v.model}</h3>
          <p>Status: {v.is_active ? "Available" : "Booked"}</p>

          {v.vehicle_bookings.map((b: any) => (
            <div key={b.id} style={{ marginTop: 10 }}>
              <p>Customer: {b.profiles?.first_name}</p>
              <p>Phone: {b.profiles?.phone}</p>
              <p>{b.start_date} → {b.end_date}</p>
              <p>Payment: {b.payment_status}</p>

              {b.payment_status === "unpaid" && (
                <button onClick={() => confirmPayment(b.id, v.id)}>
                  Confirm Payment & Re-Enable Vehicle
                </button>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}