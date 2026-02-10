import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { getProfile } from "../../lib/getProfile";
import { useNavigate } from "react-router-dom";

export default function CustomerDashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [request, setRequest] = useState<any>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  /* Driver availability */
  const [selectedDate, setSelectedDate] = useState("");
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const profileData = await getProfile();
    if (!profileData) return;

    setProfile(profileData);

    const { data: req } = await supabase
      .from("role_requests")
      .select("*")
      .eq("user_id", profileData.user_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    setRequest(req || null);

    if (profileData.role === "driver") {
      const { data: dates } = await supabase
        .from("driver_availability")
        .select("available_date")
        .eq("driver_id", profileData.user_id);

      setAvailableDates(dates?.map((d) => d.available_date) || []);
    }
  };

  /* ================= ROLE SWITCH (FINAL & CORRECT) ================= */
  const switchRole = async (role: string) => {
    if (role === profile.role) return;

    await supabase
      .from("profiles")
      .update({ role })
      .eq("user_id", profile.user_id);

    localStorage.setItem("active_role", role);

    // 🔥 IMMEDIATE VIEW CHANGE
    if (role === "owner") {
      navigate("/owner/dashboard", { replace: true });
    } else {
      navigate("/customer/home", { replace: true });
    }
  };

  /* ================= ADD AVAILABILITY DATE ================= */
  const addAvailabilityDate = async () => {
    if (!selectedDate) return;

    await supabase.from("driver_availability").insert({
      driver_id: profile.user_id,
      available_date: selectedDate,
    });

    setSelectedDate("");
    loadData();
  };

  /* ================= REMOVE AVAILABILITY DATE ================= */
  const removeAvailabilityDate = async (date: string) => {
    await supabase
      .from("driver_availability")
      .delete()
      .eq("driver_id", profile.user_id)
      .eq("available_date", date);

    loadData();
  };

  /* ================= ROLE REQUEST ================= */
  const requestRole = async (role: string) => {
    if (!licenseFile) {
      setMessage("Please upload license before requesting role");
      return;
    }

    if (request?.status === "pending") {
      setMessage("You already have a pending request");
      return;
    }

    setLoading(true);
    setMessage(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const path = `${user.id}/${Date.now()}-${licenseFile.name}`;
    const { error: uploadError } = await supabase.storage
      .from("licenses")
      .upload(path, licenseFile);

    if (uploadError) {
      setMessage("License upload failed");
      setLoading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("licenses")
      .getPublicUrl(path);

    await supabase.from("role_requests").insert({
      user_id: user.id,
      requested_role: role,
      license_url: urlData.publicUrl,
      status: "pending",
    });

    setMessage("Role request sent. Await admin approval.");
    setLicenseFile(null);
    setLoading(false);
    loadData();
  };

  if (!profile) return <p>Loading...</p>;

  return (
    <div className="profile-card">
      <h2>Dashboard</h2>

      <p>
        <b>Name:</b> {profile.first_name} {profile.last_name}
      </p>
      <p>
        <b>Active Role:</b> {profile.role}
      </p>

      <hr />

      <h3>Switch Role</h3>
      <select
        value={profile.role}
        onChange={(e) => switchRole(e.target.value)}
      >
        <option value="customer">Customer</option>
        {profile.is_driver && <option value="driver">Driver</option>}
        {profile.is_owner && <option value="owner">Owner</option>}
      </select>

      {/* ================= DRIVER DATE AVAILABILITY ================= */}
      {profile.role === "driver" && (
        <>
          <hr />
          <h3>Available Dates</h3>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <button onClick={addAvailabilityDate}>Add Date</button>

          <ul>
            {availableDates.map((date) => (
              <li key={date}>
                {date}
                <button
                  style={{ marginLeft: "10px" }}
                  onClick={() => removeAvailabilityDate(date)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <hr />

      {/* ================= REQUEST FORM ================= */}
      {!profile.is_driver && (
        <>
          <h3>Upload License</h3>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
          />
          <button
            className="action-btn"
            disabled={loading}
            onClick={() => requestRole("driver")}
          >
            Request Driver Role
          </button>
        </>
      )}

      {message && <p>{message}</p>}
    </div>
  );
}