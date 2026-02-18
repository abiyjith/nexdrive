import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function VehicleBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);

    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      setError("Not logged in");
      setLoading(false);
      return;
    }

    /**
     * IMPORTANT:
     * We filter THROUGH vehicles.owner_id
     * vehicle_bookings DOES NOT have owner_id
     */
    const { data, error } = await supabase
      .from("vehicle_bookings")
      .select(`
        id,
        start_date,
        end_date,
        status,
        vehicle:vehicles (
          id,
          brand,
          model,
          price_per_day,
          owner_id
        )
      `)
      .eq("vehicle.owner_id", auth.user.id)
      .order("start_date", { ascending: false });

    if (error) {
      console.error(error);
      setError(error.message);
      setLoading(false);
      return;
    }

    setBookings(data || []);
    setLoading(false);
  };

  if (loading) {
    return <p style={{ padding: 20 }}>Loading bookings…</p>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ color: "#facc15" }}>Vehicle Bookings</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {bookings.length === 0 && (
        <p>No bookings for your vehicles yet.</p>
      )}

      {bookings.map((b) => {
        if (!b.vehicle) {
          return (
            <div key={b.id} className="profile-card">
              <p style={{ color: "orange" }}>
                Vehicle info missing (FK mismatch – fixed after reload)
              </p>
            </div>
          );
        }

        return (
          <div key={b.id} className="profile-card" style={{ marginBottom: 20 }}>
            <h3>
              {b.vehicle.brand} {b.vehicle.model}
            </h3>

            <p>
              <b>Dates:</b> {b.start_date} → {b.end_date}
            </p>

            <p>
              <b>₹ / day:</b> {b.vehicle.price_per_day}
            </p>

            <p>
              <b>Status:</b> {b.status}
            </p>
          </div>
        );
      })}
    </div>
  );
}