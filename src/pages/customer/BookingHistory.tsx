import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function BookingHistory() {
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;

    const { data } = await supabase
      .from("vehicle_bookings")
      .select(`
        start_date,
        end_date,
        payment_status,
        vehicles ( brand, model )
      `)
      .eq("customer_id", auth.user.id);

    setBookings(data || []);
  };

  return (
    <div>
      <h2>Booking History</h2>

      {bookings.map((b, i) => (
        <div key={i} className="vehicle-card">
          <p>{b.vehicles.brand} {b.vehicles.model}</p>
          <p>{b.start_date} → {b.end_date}</p>
          <p>Payment: {b.payment_status}</p>
        </div>
      ))}
    </div>
  );
}   