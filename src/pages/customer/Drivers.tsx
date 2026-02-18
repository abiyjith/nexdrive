import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import DatePicker from "react-multi-date-picker";

type DriverProfile = {
  user_id: string;
  first_name: string;
  last_name: string;
};

type DriverAvailability = {
  driver_id: string;
  available_date: string;
};

export default function Drivers() {
  const [selectedDates, setSelectedDates] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [availabilityMap, setAvailabilityMap] = useState<
    Record<string, string[]>
  >({});
  const [pickupLocation, setPickupLocation] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "gpay">("cash");
  const [message, setMessage] = useState("");

  /* ================= SEARCH DRIVERS ================= */
  const searchDrivers = async () => {
    if (selectedDates.length === 0) {
      setMessage("Please select at least one date");
      return;
    }

    setMessage("");

    const dateStrings = selectedDates.map((d) => d.format("YYYY-MM-DD"));

    // 1️⃣ Get matching availability (ANY matching date)
    const { data: availability } = await supabase
      .from("driver_availability")
      .select("driver_id, available_date")
      .in("available_date", dateStrings);

    if (!availability || availability.length === 0) {
      setDrivers([]);
      setMessage("No drivers available for selected dates");
      return;
    }

    // 2️⃣ Unique driver IDs
    const driverIds = [
      ...new Set(availability.map((a) => a.driver_id)),
    ];

    // 3️⃣ Get driver profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, first_name, last_name")
      .in("user_id", driverIds)
      .eq("is_driver", true);

    setDrivers(profiles || []);

    // 4️⃣ Map availability per driver
    const map: Record<string, string[]> = {};
    availability.forEach((a: DriverAvailability) => {
      if (!map[a.driver_id]) map[a.driver_id] = [];
      map[a.driver_id].push(a.available_date);
    });

    setAvailabilityMap(map);
  };

  /* ================= HIRE DRIVER ================= */
  const hireDriver = async (driver: DriverProfile) => {
    if (!pickupLocation) {
      setMessage("Please enter pickup location");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const dates = selectedDates.map((d) => d.format("YYYY-MM-DD"));
    const totalPrice = dates.length * 500; // temporary (can link driver price later)

    // 1️⃣ Insert hire
    const { error } = await supabase.from("driver_hires").insert({
      customer_id: user.id,
      driver_id: driver.user_id,
      start_date: dates[0],
      end_date: dates[dates.length - 1],
      status: "pending",
      payment_status: "awaiting_confirmation",
      payment_method: paymentMethod,
      pickup_location: pickupLocation,
      total_price: totalPrice,
    });

    if (error) {
      setMessage("Failed to hire driver");
      return;
    }

    // 2️⃣ Remove ONLY hired dates
    await supabase
      .from("driver_availability")
      .delete()
      .eq("driver_id", driver.user_id)
      .in("available_date", dates);

    setMessage("Driver hired successfully");
    setDrivers([]);
    setSelectedDates([]);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ color: "#facc15" }}>Find a Driver</h2>

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

      <br /><br />

      <input
        placeholder="Pickup location (address or landmark)"
        value={pickupLocation}
        onChange={(e) => setPickupLocation(e.target.value)}
        style={{ width: "100%", padding: 8 }}
      />

      <br /><br />

      <label><b>Payment Method</b></label>
      <select
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value as any)}
        style={{ marginLeft: 10 }}
      >
        <option value="cash">Cash</option>
        <option value="gpay">GPay</option>
      </select>

      {message && <p style={{ color: "#facc15" }}>{message}</p>}

      <hr />

      {drivers.map((d) => (
        <div key={d.user_id} className="hire-card">
          <p>
            <b>Name:</b> {d.first_name} {d.last_name}
          </p>

          <p>
            <b>Available Dates:</b>{" "}
            {availabilityMap[d.user_id]?.join(", ")}
          </p>

          <p>
            <b>Total Price:</b> ₹{selectedDates.length * 500}
          </p>

          <button className="primary-btn" onClick={() => hireDriver(d)}>
            Hire Driver
          </button>
        </div>
      ))}
    </div>
  );
}