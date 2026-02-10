import { useState } from "react";
import { supabase } from "../lib/supabase";

type Props = {
  driverId: string;
  driverName: string;
  onClose: () => void;
};

export default function RequestDriverModal({
  driverId,
  driverName,
  onClose,
}: Props) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submitRequest() {
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

    const { error } = await supabase.from("driver_hires").insert({
      customer_id: user.id,
      driver_id: driverId,
      start_date: startDate,
      end_date: endDate,
      status: "pending",
    });

    if (error) {
      setError("Failed to send driver request.");
    } else {
      setMessage("Driver request sent successfully.");
    }

    setLoading(false);
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        className="card"
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <h3>Request Driver</h3>
        <p>
          <b>Driver:</b> {driverName}
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

        <div style={{ marginTop: "15px" }}>
          <button onClick={submitRequest} disabled={loading}>
            {loading ? "Sending..." : "Confirm Request"}
          </button>
          <button
            onClick={onClose}
            style={{ marginLeft: "10px", background: "#555", color: "#fff" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}