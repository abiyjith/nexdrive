import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";

type RoleRequest = {
  requested_role: "driver" | "owner";
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
};

export default function OwnerDashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  const [driverRequest, setDriverRequest] = useState<RoleRequest | null>(null);

  /* ================= LOAD DATA ================= */
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

    // Role requests
    const { data: requests } = await supabase
      .from("role_requests")
      .select("requested_role, status, admin_note")
      .eq("user_id", auth.user.id);

    let updatedProfile = { ...profileData };

    if (requests) {
      const driverReq =
        requests.find((r) => r.requested_role === "driver") || null;

      setDriverRequest(driverReq);

      // 🔄 AUTO-SYNC AFTER ADMIN APPROVAL
      if (driverReq?.status === "approved" && !profileData.is_driver) {
        await supabase
          .from("profiles")
          .update({ is_driver: true })
          .eq("user_id", auth.user.id);

        updatedProfile.is_driver = true;
      }
    }

    setProfile(updatedProfile);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ================= ROLE SWITCH ================= */
  const handleRoleChange = async (role: string) => {
    await supabase
      .from("profiles")
      .update({ active_role: role })
      .eq("user_id", profile.user_id);

    setProfile({ ...profile, active_role: role });

    if (role === "customer") navigate("/customer/dashboard");
    if (role === "driver") navigate("/driver/dashboard");
    if (role === "owner") navigate("/owner/dashboard");
  };

  /* ================= REQUEST DRIVER ROLE ================= */
  const requestDriverRole = async () => {
    if (!licenseFile) {
      setMessage("Please upload license / ID proof");
      return;
    }

    const filePath = `${profile.user_id}/driver-${Date.now()}-${licenseFile.name}`;

    const { error: uploadError } = await supabase.storage
      .from("licenses")
      .upload(filePath, licenseFile);

    if (uploadError) {
      setMessage("License upload failed");
      return;
    }

    const { data } = supabase.storage
      .from("licenses")
      .getPublicUrl(filePath);

    const { error } = await supabase.from("role_requests").insert({
      user_id: profile.user_id,
      requested_role: "driver",
      status: "pending",
      license_url: data.publicUrl,
    });

    if (error) {
      setMessage("Request already exists or failed");
      return;
    }

    setMessage("Driver role request sent");
    loadData();
  };

  if (loading || !profile) return null;

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
        <b>Active Role:</b> {profile.active_role}
      </p>

      <hr />

      {/* 🔁 ROLE SWITCH */}
      <h3>Switch Role</h3>
      <select
        value={profile.active_role}
        onChange={(e) => handleRoleChange(e.target.value)}
      >
        <option value="customer">Customer</option>
        {profile.is_driver && <option value="driver">Driver</option>}
        {profile.is_owner && <option value="owner">Owner</option>}
      </select>

      <hr />

      {/* 📤 REQUEST DRIVER ROLE */}
      {!profile.is_driver && (
        <>
          <h3>Request Driver Role</h3>

          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) =>
              setLicenseFile(e.target.files?.[0] || null)
            }
          />

          <button onClick={requestDriverRole}>
            Request Driver Role
          </button>

          {driverRequest?.status === "pending" && (
            <p>Driver request pending admin approval</p>
          )}
        </>
      )}

      {message && <p>{message}</p>}

      <hr />

      {/* OWNER FEATURES */}
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