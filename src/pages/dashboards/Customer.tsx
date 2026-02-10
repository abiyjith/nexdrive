import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { getProfile } from "../../lib/getProfile";
import { useNavigate } from "react-router-dom";

export default function CustomerDashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [request, setRequest] = useState<any>(null);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const profileData = await getProfile();
    if (!profileData) return;

    setProfile(profileData);

    const { data } = await supabase
      .from("role_requests")
      .select("*")
      .eq("user_id", profileData.user_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    setRequest(data || null);
  }

  /* ================= REQUEST ROLE ================= */
  async function requestRole(role: "driver" | "owner") {
    if (!docFile) {
      setMessage("Please upload required document");
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

    const path = `${user.id}/${role}-${Date.now()}-${docFile.name}`;

    const { error: uploadError } = await supabase.storage
      .from("licenses")
      .upload(path, docFile);

    if (uploadError) {
      setMessage("Document upload failed");
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

    setMessage(`${role.toUpperCase()} role request sent for admin approval`);
    setDocFile(null);
    setLoading(false);
    loadData();
  }

  if (!profile) return <p>Loading...</p>;

  return (
    <div className="profile-card">
      <h2>Dashboard</h2>

      <p><b>Name:</b> {profile.first_name} {profile.last_name}</p>
      <p><b>Active Role:</b> {profile.active_role}</p>

      <hr />

      {/* ================= ROLE REQUEST ================= */}
      <h3>Request Additional Role</h3>

      <input
        type="file"
        accept="image/*,.pdf"
        onChange={(e) => setDocFile(e.target.files?.[0] || null)}
      />

      {!profile.is_driver && (
        <button
          disabled={loading}
          onClick={() => requestRole("driver")}
        >
          Request Driver Role
        </button>
      )}

      {!profile.is_owner && (
        <button
          disabled={loading}
          onClick={() => requestRole("owner")}
          style={{ marginLeft: "10px" }}
        >
          Request Owner Role
        </button>
      )}

      {message && <p style={{ marginTop: "10px" }}>{message}</p>}
    </div>
  );
}