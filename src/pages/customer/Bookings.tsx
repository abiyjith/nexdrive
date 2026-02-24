import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function CustomerBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);

    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;

    const { data, error } = await supabase
      .from("vehicle_bookings")
      .select(`
        id,
        start_date,
        end_date,
        status,
        payment_status,
        vehicles (
          brand,
          model,
          price_per_day
        )
      `)
      .eq("customer_id", auth.user.id)
      .order("created_at", { ascending: false });

    if (!error) {
      setBookings(data || []);
    }

    setLoading(false);
  };

  if (loading) {
    return <p style={{ padding: 20 }}>Loading bookings...</p>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ color: "#facc15" }}>My Vehicle Bookings</h2>

      {bookings.length === 0 && (
        <p>You have not booked any vehicles yet.</p>
      )}

      {bookings.map((b) => (
        <div
          key={b.id}
          className="vehicle-card"
          style={{ marginBottom: 20 }}
        >
          <h3>
            {b.vehicles?.brand} {b.vehicles?.model}
          </h3>

          <p>
            <b>Dates:</b> {b.start_date} → {b.end_date}
          </p>

          <p>
            <b>Status:</b> {b.status}
          </p>

          <p>
            <b>Payment:</b>{" "}
            {b.payment_status === "pending" ? (
              <span style={{ color: "orange" }}>Not Paid</span>
            ) : b.payment_status === "paid" ? (
              <span style={{ color: "yellow" }}>Paid (Waiting confirmation)</span>
            ) : (
              <span style={{ color: "lightgreen" }}>Confirmed</span>
            )}
          </p>

          {b.payment_status === "pending" && (
            <p style={{ color: "red" }}>
              ⚠ Payment pending. Please pay the owner.
            </p>
          )}
        </div>
      ))}
    </div>
  );
}