import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type RoleRequest = {
  requested_role: "driver" | "owner";
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
};

export default function CustomerDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  const [driverRequest, setDriverRequest] = useState<RoleRequest | null>(null);
  const [ownerRequest, setOwnerRequest] = useState<RoleRequest | null>(null);

  const loadAll = async () => {
    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setLoading(false);
      return;
    }

    // 🔁 ALWAYS fetch fresh profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    setProfile(profileData);

    // Load role requests
    const { data: requests } = await supabase
      .from("role_requests")
      .select("requested_role, status, admin_note")
      .eq("user_id", session.user.id);

    if (requests) {
      setDriverRequest(
        requests.find((r) => r.requested_role === "driver") || null
      );
      setOwnerRequest(
        requests.find((r) => r.requested_role === "owner") || null
      );
    }

    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  // 🔁 Switch role
  const handleRoleChange = async (role: string) => {
    if (!profile) return;

    await supabase
      .from("profiles")
      .update({ active_role: role })
      .eq("id", profile.id);

    // reload profile to reflect change
    await loadAll();
  };

  // 📤 Request role
  const requestRole = async (role: "driver" | "owner") => {
    if (!licenseFile) {
      setMessage("Please upload license / ID proof first");
      return;
    }

    setMessage("");

    const filePath = `${profile.user_id}/${role}-${Date.now()}-${licenseFile.name}`;

    const { error: uploadError } = await supabase.storage
      .from("licenses")
      .upload(filePath, licenseFile);

    if (uploadError) {
      setMessage("License upload failed");
      return;
    }

    const { data: urlData } = supabase.storage
      .from("licenses")
      .getPublicUrl(filePath);

    const { error } = await supabase.from("role_requests").insert({
      user_id: profile.user_id,
      requested_role: role,
      status: "pending",
      license_url: urlData.publicUrl,
    });

    if (error) {
      setMessage("Request already exists or failed");
      return;
    }

    setMessage("Role request sent successfully");
    setLicenseFile(null);
    await loadAll();
  };

  if (loading || !profile) return null;

  return (
    <div style={{ padding: "20px", maxWidth: "420px" }}>
      <h2 style={{ color: "#facc15" }}>Dashboard</h2>

      <p>
        <strong>Name:</strong> {profile.first_name} {profile.last_name}
      </p>

      <p>
        <strong>Active Role:</strong> {profile.active_role}
      </p>

      {/* ROLE SWITCH */}
      <div style={{ marginTop: "12px" }}>
        <label style={{ display: "block", marginBottom: "6px" }}>
          Switch Role
        </label>

        <select
          value={profile.active_role}
          onChange={(e) => handleRoleChange(e.target.value)}
          style={{
            width: "180px",
            padding: "6px",
            background: "#111",
            color: "#fff",
            border: "1px solid #facc15",
            borderRadius: "6px",
          }}
        >
          <option value="customer">Customer</option>
          {profile.is_driver && <option value="driver">Driver</option>}
          {profile.is_owner && <option value="owner">Owner</option>}
        </select>
      </div>

      {/* REQUEST ROLE */}
      <div style={{ marginTop: "20px" }}>
        <h4 style={{ marginBottom: "10px" }}>Request Additional Role</h4>

        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
          style={{ marginBottom: "10px", display: "block" }}
        />

        {/* DRIVER */}
        {!profile.is_driver && (
          <>
            {driverRequest?.status === "pending" && (
              <p style={{ color: "#facc15" }}>
                Driver request pending approval
              </p>
            )}

            {driverRequest?.status === "rejected" && (
              <p style={{ color: "#f87171" }}>
                Driver request rejected: {driverRequest.admin_note}
              </p>
            )}

            {!driverRequest && (
              <button
                onClick={() => requestRole("driver")}
                style={{
                  marginRight: "10px",
                  padding: "8px 14px",
                  background: "#facc15",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Request Driver Role
              </button>
            )}
          </>
        )}

        {/* OWNER */}
        {!profile.is_owner && (
          <>
            {ownerRequest?.status === "pending" && (
              <p style={{ color: "#facc15" }}>
                Owner request pending approval
              </p>
            )}

            {ownerRequest?.status === "rejected" && (
              <p style={{ color: "#f87171" }}>
                Owner request rejected: {ownerRequest.admin_note}
              </p>
            )}

            {!ownerRequest && (
              <button
                onClick={() => requestRole("owner")}
                style={{
                  padding: "8px 14px",
                  background: "#facc15",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Request Owner Role
              </button>
            )}
          </>
        )}

        {message && (
          <p style={{ marginTop: "10px", color: "#facc15" }}>{message}</p>
        )}
      </div>
    </div>
  );
}