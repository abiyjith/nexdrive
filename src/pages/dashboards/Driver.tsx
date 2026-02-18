import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import DatePicker from "react-multi-date-picker";
import { useNavigate } from "react-router-dom";

type RoleRequest = {
  requested_role: "driver" | "owner";
  status: "pending" | "approved" | "rejected";
};

export default function DriverDashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [availability, setAvailability] = useState<string[]>([]);
  const [selectedDates, setSelectedDates] = useState<any[]>([]);
  const [hires, setHires] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [ownerRequest, setOwnerRequest] = useState<RoleRequest | null>(null);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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

    // Availability
    const { data: avail } = await supabase
      .from("driver_availability")
      .select("available_date")
      .eq("driver_id", auth.user.id);

    setAvailability(avail?.map(a => a.available_date) || []);

    // Hires
    const { data: hireData } = await supabase
      .from("driver_hires")
      .select("*")
      .eq("driver_id", auth.user.id)
      .order("created_at", { ascending: false });

    setHires(hireData || []);

    // Owner role request
    const { data: requests } = await supabase
      .from("role_requests")
      .select("requested_role, status")
      .eq("user_id", auth.user.id)
      .eq("requested_role", "owner")
      .maybeSingle();

    if (requests) setOwnerRequest(requests);
  };

  /* ================= ROLE SWITCH ================= */
  const handleRoleChange = async (role: string) => {
    await supabase
      .from("profiles")
      .update({ active_role: role })
      .eq("user_id", profile.user_id);

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

  /* ================= REQUEST OWNER ROLE ================= */
  const requestOwnerRole = async () => {
    if (!licenseFile) {
      setMessage("Upload license / ID proof first");
      return;
    }

    const filePath = `${profile.user_id}/owner-${Date.now()}-${licenseFile.name}`;

    const { error: uploadError } = await supabase.storage
      .from("licenses")
      .upload(filePath, licenseFile);

    if (uploadError) {
      setMessage("File upload failed");
      return;
    }

    const { data } = supabase.storage
      .from("licenses")
      .getPublicUrl(filePath);

    const { error } = await supabase.from("role_requests").insert({
      user_id: profile.user_id,
      requested_role: "owner",
      status: "pending",
      license_url: data.publicUrl,
    });

    if (error) {
      setMessage("Owner request already exists");
      return;
    }

    setMessage("Owner role request sent for approval");
    loadData();
  };

  /* ================= UPDATE HIRE ================= */
  const updateHire = async (id: string, status: string) => {
    await supabase
      .from("driver_hires")
      .update({ status })
      .eq("id", id);

    loadData();
  };

  /* ================= CONFIRM PAYMENT ================= */
  const confirmPayment = async (id: string) => {
    await supabase
      .from("driver_hires")
      .update({ payment_status: "paid" })
      .eq("id", id);

    loadData();
  };

  if (!profile) return null;

  return (
    <div className="driver-card">
      <h2>Driver Dashboard</h2>

      <p><b>Name:</b> {profile.first_name} {profile.last_name}</p>

      {/* ROLE SWITCH */}
      <label><b>Switch Role</b></label>
      <select
        value={profile.active_role}
        onChange={(e) => handleRoleChange(e.target.value)}
      >
        <option value="customer">Customer</option>
        {profile.is_driver && <option value="driver">Driver</option>}
        {profile.is_owner && <option value="owner">Owner</option>}
      </select>

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

      {/* REQUEST OWNER ROLE */}
      {!profile.is_owner && (
        <>
          <h4>Request Owner Role</h4>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
          />

          {!ownerRequest && (
            <button onClick={requestOwnerRole}>
              Request Owner Role
            </button>
          )}

          {ownerRequest?.status === "pending" && (
            <p>Owner request pending admin approval</p>
          )}
        </>
      )}

      {/* HIRE REQUESTS */}
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