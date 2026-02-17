import { useState } from "react";
import { supabase } from "../../lib/supabase";
import DatePicker from "react-multi-date-picker";

type Driver = {
  id: string;
  owner_id: string;
  name: string;
  experience_years: number;
  price_per_day: number;
};

export default function Drivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDates, setSelectedDates] = useState<any[]>([]);
  const [pickupLocation, setPickupLocation] = useState("");
  const [message, setMessage] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<"cash" | "gpay" | null>(null);

  /* ================= STEP 0 – CLEAN PAST AVAILABILITY ================= */
  const cleanPastAvailability = async () => {
    const today = new Date().toISOString().split("T")[0];

    await supabase
      .from("driver_availability")
      .delete()
      .lt("available_date", today);
  };

  /* ================= STEP 1 – SEARCH DRIVERS ================= */
  const searchDrivers = async () => {
    setMessage("");
    setDrivers([]);

    await cleanPastAvailability();

    if (selectedDates.length === 0) {
      setMessage("Please select at least one date");
      return;
    }

    const dateStrings = selectedDates.map((d) =>
      d.format("YYYY-MM-DD")
    );

    // Find drivers available on ANY selected date
    const { data: availability } = await supabase
      .from("driver_availability")
      .select("driver_id")
      .in("available_date", dateStrings);

    if (!availability || availability.length === 0) {
      setMessage("No drivers available for selected date(s)");
      return;
    }

    const driverIds = [
      ...new Set(availability.map((a) => a.driver_id)),
    ];

    const { data: driverData, error } = await supabase
      .from("drivers")
      .select("*")
      .in("owner_id", driverIds)
      .eq("verified", true);

    if (error || !driverData) {
      setMessage("Failed to load drivers");
      return;
    }

    setDrivers(driverData);
  };

  /* ================= STEP 2 + 3 – HIRE + PAYMENT ================= */
  const hireDriver = async (driver: Driver) => {
    if (!pickupLocation) {
      setMessage("Please enter pickup location");
      return;
    }

    if (!paymentMethod) {
      setMessage("Select payment method");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const dates = selectedDates.map((d) =>
      d.format("YYYY-MM-DD")
    );

    const totalPrice = dates.length * driver.price_per_day;

    // Create hire record
    const { error } = await supabase
      .from("driver_hires")
      .insert({
        customer_id: user.id,
        driver_id: driver.owner_id,
        start_date: dates[0],
        end_date: dates[dates.length - 1],
        status: "pending",
        pickup_location: pickupLocation,
        payment_method: paymentMethod,
        payment_status: "awaiting_confirmation",
        total_price: totalPrice,
      });

    if (error) {
      setMessage("Failed to hire driver");
      return;
    }

    // Remove ONLY booked dates
    await supabase
      .from("driver_availability")
      .delete()
      .eq("driver_id", driver.owner_id)
      .in("available_date", dates);

    setMessage("Driver hired. Waiting for driver confirmation.");
    setDrivers([]);
    setSelectedDates([]);
    setPickupLocation("");
    setPaymentMethod(null);
  };

  return (
    <div style={{ padding: 20, maxWidth: 900 }}>
      <h2 style={{ color: "#facc15" }}>Find Drivers</h2>

      {/* DATE PICKER */}
      <DatePicker
        multiple
        minDate={new Date()}
        value={selectedDates}
        onChange={setSelectedDates}
        format="YYYY-MM-DD"
      />

      <br />
      <button className="primary-btn" onClick={searchDrivers}>
        Search Drivers
      </button>

      {/* PICKUP LOCATION */}
      <h4 style={{ marginTop: 20 }}>Pickup Location</h4>
      <input
        placeholder="Enter pickup address"
        value={pickupLocation}
        onChange={(e) => setPickupLocation(e.target.value)}
        style={{ width: "100%", padding: 8 }}
      />

      {/* PAYMENT */}
      <h4 style={{ marginTop: 20 }}>Payment Method</h4>
      <label>
        <input
          type="radio"
          name="payment"
          checked={paymentMethod === "cash"}
          onChange={() => setPaymentMethod("cash")}
        />{" "}
        Cash
      </label>
      <br />
      <label>
        <input
          type="radio"
          name="payment"
          checked={paymentMethod === "gpay"}
          onChange={() => setPaymentMethod("gpay")}
        />{" "}
        GPay / UPI
      </label>

      {message && (
        <p style={{ color: "#facc15", marginTop: 10 }}>{message}</p>
      )}

      {/* DRIVER LIST */}
      {drivers.map((d) => (
        <div key={d.id} className="hire-card">
          <p><b>Name:</b> {d.name}</p>
          <p><b>Experience:</b> {d.experience_years} years</p>
          <p><b>Price / day:</b> ₹{d.price_per_day}</p>
          <p>
            <b>Total:</b> ₹{selectedDates.length * d.price_per_day}
          </p>

          <button className="primary-btn" onClick={() => hireDriver(d)}>
            Hire Driver
          </button>
        </div>
      ))}
    </div>
  );
}