import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import DatePicker from "react-multi-date-picker";
import { useNavigate } from "react-router-dom";

export default function DriverDashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [activeRole, setActiveRole] = useState("driver");

  const [availability, setAvailability] = useState<string[]>([]);
  const [selectedDates, setSelectedDates] = useState<any[]>([]);
  const [hires, setHires] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const load = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;

      // Profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", auth.user.id)
        .single();

      if (!profileData) return;

      setProfile(profileData);
      setActiveRole(profileData.active_role);

      // Availability
      const { data: avail } = await supabase
        .from("driver_availability")
        .select("available_date")
        .eq("driver_id", auth.user.id);

      setAvailability(avail?.map(a => a.available_date) || []);

      // Hire requests
      const { data: hireData } = await supabase
        .from("driver_hires")
        .select("*")
        .eq("driver_id", auth.user.id)
        .order("created_at", { ascending: false });

      setHires(hireData || []);
    };

    load();
  }, []);

  /* ================= ROLE SWITCH ================= */
  const changeRole = async (role: string) => {
    await supabase
      .from("profiles")
      .update({ active_role: role })
      .eq("user_id", profile.user_id);

    setActiveRole(role);

    if (role === "customer") navigate("/customer/dashboard");
    if (role === "driver") navigate("/driver/dashboard");
    if (role === "owner") navigate("/owner/dashboard");
  };

  /* ================= SAVE AVAILABILITY ================= */
  const saveAvailability = async () => {
    if (selectedDates.length === 0) {
      setMessage("Select at least one date");
      return;
    }

    const rows = selectedDates.map(d => ({
      driver_id: profile.user_id,
      available_date: d.format("YYYY-MM-DD"),
    }));

    const { error } = await supabase
      .from("driver_availability")
      .insert(rows);

    if (error) {
      setMessage("Some dates already exist");
      return;
    }

    setAvailability([...availability, ...rows.map(r => r.available_date)]);
    setSelectedDates([]);
    setMessage("Availability updated");
  };

  /* ================= UPDATE HIRE ================= */
  const updateHire = async (id: string, status: string) => {
    await supabase
      .from("driver_hires")
      .update({ status })
      .eq("id", id);

    window.location.reload();
  };

  /* ================= CONFIRM PAYMENT ================= */
  const confirmPayment = async (id: string) => {
    await supabase
      .from("driver_hires")
      .update({ payment_status: "paid" })
      .eq("id", id);

    window.location.reload();
  };

  if (!profile) return null;

  return (
    <div className="driver-card">
      <h2>Driver Dashboard</h2>

      <p><b>Name:</b> {profile.first_name} {profile.last_name}</p>

      {/* ROLE SWITCH */}
      <div style={{ marginBottom: 20 }}>
        <label><b>Switch Role</b></label>
        <select
          value={activeRole}
          onChange={(e) => changeRole(e.target.value)}
        >
          <option value="customer">Customer</option>
          {profile.is_driver && <option value="driver">Driver</option>}
          {profile.is_owner && <option value="owner">Owner</option>}
        </select>
      </div>

      {/* AVAILABILITY */}
      <h4>Availability</h4>

      <DatePicker
        multiple
        minDate={new Date()}
        value={selectedDates}
        onChange={setSelectedDates}
        format="YYYY-MM-DD"
      />

      <button onClick={saveAvailability}>Save Availability</button>
      {message && <p>{message}</p>}

      <ul>
        {availability.map(d => <li key={d}>{d}</li>)}
      </ul>

      {/* HIRES */}
      <h4 style={{ marginTop: 30 }}>Hire Requests</h4>

      {hires.length === 0 && <p>No hire requests yet</p>}

      {hires.map(h => (
        <div key={h.id} className="hire-card">
          <p><b>Customer:</b> {h.customer_id}</p>
          <p><b>Date:</b> {h.start_date}</p>
          <p><b>Status:</b> {h.status}</p>
          <p><b>Payment:</b> {h.payment_status || "unpaid"}</p>

          {h.pickup_lat && (
            <a
              href={`https://www.google.com/maps?q=${h.pickup_lat},${h.pickup_lng}`}
              target="_blank"
              rel="noreferrer"
            >
              Open Pickup Location
            </a>
          )}

          {h.payment_status === "awaiting_confirmation" && (
            <button onClick={() => confirmPayment(h.id)}>
              Confirm Payment
            </button>
          )}

          {h.status !== "completed" && (
            <button onClick={() => updateHire(h.id, "completed")}>
              Mark Completed
            </button>
          )}
        </div>
      ))}
    </div>
  );
}