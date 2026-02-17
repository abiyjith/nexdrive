import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function HireDriver() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const driverId = params.get("driver")!;
  const date = params.get("date")!;

  const [driver, setDriver] = useState<any>(null);
  const [payment, setPayment] = useState("cash");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("drivers")
        .select("*")
        .eq("id", driverId)
        .single();

      setDriver(data);
    };

    load();
  }, [driverId]);

  const confirmHire = async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;

    // Create hire
    await supabase.from("driver_hires").insert({
      driver_id: driver.owner_id,
      customer_id: auth.user.id,
      start_date: date,
      end_date: date,
      status: "pending",
    });

    // Create booking
    await supabase.from("driver_bookings").insert({
      driver_id: driver.id,
      customer_id: auth.user.id,
      start_date: date,
      end_date: date,
      total_price: driver.price_per_day,
      status: "confirmed",
    });

    // 🔥 REMOVE THAT DAY FROM AVAILABILITY
    await supabase
      .from("driver_availability")
      .delete()
      .eq("driver_id", driver.owner_id)
      .eq("available_date", date);

    navigate("/customer/dashboard");
  };

  if (!driver) return null;

  return (
    <div className="driver-card">
      <h2>Confirm Hire</h2>

      <p><b>Driver:</b> {driver.name}</p>
      <p><b>Date:</b> {date}</p>
      <p><b>Price:</b> ₹{driver.price_per_day}</p>

      <label>Payment Method</label>
      <select value={payment} onChange={(e) => setPayment(e.target.value)}>
        <option value="cash">Cash</option>
        <option value="upi">UPI</option>
      </select>

      <button onClick={confirmHire}>Confirm & Pay</button>
    </div>
  );
}