import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import DatePicker from "react-multi-date-picker";

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [dates, setDates] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVehicles();
  }, []);

 const loadVehicles = async () => {
  const { data, error } = await supabase
    .from("vehicles")
    .select(`
      id,
      brand,
      model,
      price_per_day,
      location_text,
      vehicle_bookings (
        id,
        status
      )
    `)
    .eq("verification_status", "approved")
    .eq("is_active", true);

  if (error) {
    console.error(error);
    return;
  }

  // 🚫 FILTER OUT VEHICLES WITH ACTIVE BOOKINGS
  const available = (data || []).filter((v) =>
    !v.vehicle_bookings?.some(
      (b: any) => b.status === "pending" || b.status === "confirmed"
    )
  );

  setVehicles(available);
};

  const bookVehicle = async () => {
    if (!selectedVehicle || dates.length === 0) {
      setMessage("Select booking dates");
      return;
    }

    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;

    setLoading(true);

    const days = dates.map((d) => d.format("YYYY-MM-DD"));
    const total = days.length * selectedVehicle.price_per_day;

    const { data: booking, error } = await supabase
      .from("vehicle_bookings")
      .insert({
        vehicle_id: selectedVehicle.id,
        customer_id: auth.user.id,
        start_date: days[0],
        end_date: days[days.length - 1],
        status: "pending",
        payment_status: "unpaid",
        total_price: total,
      })
      .select()
      .single();

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    // create payment
    await supabase.from("payments").insert({
      booking_id: booking.id,
      payer_id: auth.user.id,
      amount: total,
    });

    // hide vehicle
    await supabase
      .from("vehicles")
      .update({ is_active: false })
      .eq("id", selectedVehicle.id);

    setMessage("Booking successful. Await owner confirmation.");
    setSelectedVehicle(null);
    setDates([]);
    loadVehicles();
    setLoading(false);
  };

  return (
    <div className="page-container">
      <h2 style={{ color: "#facc15" }}>Available Vehicles</h2>

      {vehicles.map((v) => (
        <div key={v.id} className="vehicle-card">
          <h3>{v.brand} {v.model}</h3>
          <p>₹ {v.price_per_day} / day</p>

          <button onClick={() => setSelectedVehicle(v)}>
            Book Vehicle
          </button>
        </div>
      ))}

      {selectedVehicle && (
        <div className="booking-box">
          <h3>
            Booking {selectedVehicle.brand} {selectedVehicle.model}
          </h3>

          <DatePicker
            multiple
            value={dates}
            onChange={setDates}
            format="YYYY-MM-DD"
          />

          <p>
            Total ₹{dates.length * selectedVehicle.price_per_day}
          </p>

          <button disabled={loading} onClick={bookVehicle}>
            Confirm Booking
          </button>

          <button onClick={() => setSelectedVehicle(null)}>
            Cancel
          </button>
        </div>
      )}

      {message && <p>{message}</p>}
    </div>
  );
}