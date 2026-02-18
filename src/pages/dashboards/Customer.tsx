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

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", auth.user.id)
      .single();

    if (!profileData) return;

    const { data: requests } = await supabase
      .from("role_requests")
      .select("requested_role, status, admin_note")
      .eq("user_id", auth.user.id);

    let updatedProfile = { ...profileData };

    if (requests) {
      const driverReq = requests.find(r => r.requested_role === "driver") || null;
      const ownerReq = requests.find(r => r.requested_role === "owner") || null;

      setDriverRequest(driverReq);
      setOwnerRequest(ownerReq);

      if (driverReq?.status === "approved" && !profileData.is_driver) {
        await supabase.from("profiles").update({ is_driver: true }).eq("user_id", auth.user.id);
        updatedProfile.is_driver = true;
      }

      if (ownerReq?.status === "approved" && !profileData.is_owner) {
        await supabase.from("profiles").update({ is_owner: true }).eq("user_id", auth.user.id);
        updatedProfile.is_owner = true;
      }
    }

    setProfile(updatedProfile);
    setLoading(false);
  };

  const handleRoleChange = async (role: string) => {
    await supabase
      .from("profiles")
      .update({ active_role: role })
      .eq("user_id", profile.user_id);

    setProfile({ ...profile, active_role: role });
  };

  const requestRole = async (role: "driver" | "owner") => {
    if (!licenseFile) {
      setMessage("Upload license / ID proof first");
      return;
    }

    const path = `${profile.user_id}/${role}-${Date.now()}-${licenseFile.name}`;

    await supabase.storage.from("licenses").upload(path, licenseFile);
    const { data } = supabase.storage.from("licenses").getPublicUrl(path);

    await supabase.from("role_requests").insert({
      user_id: profile.user_id,
      requested_role: role,
      status: "pending",
      license_url: data.publicUrl,
    });

    setMessage("Role request sent");
    loadAll();
  };

  if (loading || !profile) return null;

  return (
    <div style={{ padding: 20, maxWidth: 420 }}>
      <h2 style={{ color: "#facc15" }}>Customer Dashboard</h2>

      <p><b>Name:</b> {profile.first_name} {profile.last_name}</p>
      <p><b>Active Role:</b> {profile.active_role}</p>

      <label>Switch Role</label>
      <select
        value={profile.active_role}
        onChange={(e) => handleRoleChange(e.target.value)}
      >
        <option value="customer">Customer</option>
        {profile.is_driver && <option value="driver">Driver</option>}
        {profile.is_owner && <option value="owner">Owner</option>}
      </select>

      <h4>Request Additional Role</h4>

      <input
        type="file"
        accept="image/*,.pdf"
        onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
      />

      {!profile.is_driver && !driverRequest && (
        <button onClick={() => requestRole("driver")}>Request Driver Role</button>
      )}

      {!profile.is_owner && !ownerRequest && (
        <button onClick={() => requestRole("owner")}>Request Owner Role</button>
      )}

      {driverRequest?.status === "pending" && <p>Driver request pending</p>}
      {ownerRequest?.status === "pending" && <p>Owner request pending</p>}
      {message && <p>{message}</p>}
    </div>
  );
}