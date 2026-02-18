import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import DatePicker from "react-multi-date-picker";

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [dates, setDates] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= LOAD VEHICLES ================= */
  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("verification_status", "approved")
      .eq("is_active", true);

    if (!error) {
      setVehicles(data || []);
    }
  };

  /* ================= BOOK VEHICLE ================= */
  const bookVehicle = async () => {
    if (!selectedVehicle || dates.length === 0) {
      setMessage("Select vehicle and booking dates");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    setLoading(true);
    setMessage("");

    const dateStrings = dates.map((d) => d.format("YYYY-MM-DD"));
    const totalPrice =
      dateStrings.length * Number(selectedVehicle.price_per_day);

    const { error } = await supabase.from("vehicle_bookings").insert({
      vehicle_id: selectedVehicle.id,
      customer_id: user.id,
      start_date: dateStrings[0],
      end_date: dateStrings[dateStrings.length - 1],
      status: "pending",
      total_price: totalPrice,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("✅ Vehicle booked successfully. Pay owner directly.");
    setDates([]);
    setSelectedVehicle(null);
    setLoading(false);
  };

  return (
    <div className="page-container">
      <h2 style={{ color: "#facc15" }}>Available Vehicles</h2>

      {vehicles.length === 0 && <p>No vehicles available</p>}

      {vehicles.map((v) => (
        <div key={v.id} className="vehicle-card">
          <h3>
            {v.brand} {v.model}
          </h3>

          <p>
            <b>Type:</b> {v.vehicle_type}
          </p>

          <p>
            <b>₹ {v.price_per_day}</b> / day
          </p>

          <p>
            <b>Location:</b> {v.location_text}
          </p>

          <button
            className="primary-btn"
            onClick={() => {
              setSelectedVehicle(v);
              setDates([]);
              setMessage("");
            }}
          >
            Book Vehicle
          </button>
        </div>
      ))}

      {/* ================= BOOKING BOX ================= */}
      {selectedVehicle && (
        <div className="booking-box">
          <h3>
            Booking: {selectedVehicle.brand} {selectedVehicle.model}
          </h3>

          <DatePicker
            multiple
            minDate={new Date()}
            value={dates}
            onChange={setDates}
            format="YYYY-MM-DD"
          />

          <p style={{ marginTop: 10 }}>
            <b>Total:</b> ₹
            {dates.length * Number(selectedVehicle.price_per_day)}
          </p>

          <button
            className="primary-btn"
            disabled={loading}
            onClick={bookVehicle}
          >
            {loading ? "Booking..." : "Confirm Booking"}
          </button>

          <button
            style={{ marginLeft: 10 }}
            onClick={() => {
              setSelectedVehicle(null);
              setDates([]);
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {message && <p style={{ marginTop: 15 }}>{message}</p>}
    </div>
  );
}