import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { getProfile } from "../../lib/getProfile";
import { useNavigate } from "react-router-dom";

export default function OwnerDashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const profileData = await getProfile();
    if (!profileData) return;

    setProfile(profileData);
  };

  /* ================= ROLE SWITCH (SAME AS CUSTOMER) ================= */
  const switchRole = async (role: string) => {
    if (role === profile.role) return;

    setLoading(true);

    await supabase
      .from("profiles")
      .update({ role })
      .eq("user_id", profile.user_id);

    localStorage.setItem("active_role", role);

    // 🔥 IMMEDIATE REDIRECT
    if (role === "owner") {
      navigate("/owner/dashboard", { replace: true });
    } else {
      navigate("/customer/home", { replace: true });
    }
  };

  if (!profile) return <p>Loading...</p>;

  return (
    <div className="profile-card">
      <h2>Owner Dashboard</h2>

      <p>
        <b>Name:</b> {profile.first_name} {profile.last_name}
      </p>
      <p>
        <b>Email:</b> {profile.email}
      </p>
      <p>
        <b>Active Role:</b> {profile.role}
      </p>

      <hr />

      <h3>Switch Role</h3>
      <select
        value={profile.role}
        onChange={(e) => switchRole(e.target.value)}
        disabled={loading}
      >
        <option value="customer">Customer</option>
        {profile.is_driver && <option value="driver">Driver</option>}
        {profile.is_owner && <option value="owner">Owner</option>}
      </select>

      {message && <p>{message}</p>}

      <hr />

      {/* OWNER-SPECIFIC SECTIONS (PLACEHOLDER) */}
      <h3>Owner Actions</h3>
      <ul>
        <li>Upload Vehicles</li>
        <li>Manage Vehicle Availability</li>
        <li>View Bookings</li>
        <li>Track Earnings</li>
      </ul>
    </div>
  );
}