import { useState } from "react";
import { supabase } from "../lib/supabase";

type Props = {
  vehicleId: string;
  vehicleName: string;
  pricePerDay: number;
  onClose: () => void;
  onBooked: () => void;
};

export default function VehicleBookingModal({
  vehicleId,
  vehicleName,
  pricePerDay,
  onClose,
  onBooked,
}: Props) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function calculateDays() {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff =
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 ? diff + 1 : 0;
  }

  async function confirmBooking() {
    setError(null);
    setMessage(null);

    if (!startDate || !endDate) {
      setError("Please select both start and end dates.");
      return;
    }

    if (endDate < startDate) {
      setError("End date cannot be before start date.");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("User not authenticated.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("vehicle_bookings").insert({
      vehicle_id: vehicleId,
      customer_id: user.id,
      start_date: startDate,
      end_date: endDate,
      status: "pending",
    });

    if (error) {
      setError("Failed to book vehicle. Please try again.");
    } else {
      setMessage("Booking request sent successfully.");
      onBooked();
    }

    setLoading(false);
  }

  const days = calculateDays();
  const totalCost = days * pricePerDay;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div className="card" style={{ maxWidth: "420px", width: "100%" }}>
        <h3>Book Vehicle</h3>

        <p>
          <b>{vehicleName}</b>
        </p>

        {error && <div className="alert error">{error}</div>}
        {message && <div className="alert success">{message}</div>}

        <label>Start Date</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <label>End Date</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        {days > 0 && (
          <p>
            <b>{days}</b> day(s) × ₹{pricePerDay} ={" "}
            <b>₹{totalCost}</b>
          </p>
        )}

        <div style={{ marginTop: "15px" }}>
          <button onClick={confirmBooking} disabled={loading}>
            {loading ? "Booking..." : "Confirm Booking"}
          </button>
          <button
            onClick={onClose}
            style={{
              marginLeft: "10px",
              background: "#555",
              color: "#fff",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}