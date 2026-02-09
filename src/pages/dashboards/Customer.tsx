import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { getProfile } from "../../lib/getProfile";

export default function CustomerDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    getProfile().then(setProfile);
  }, []);

  const requestRole = async (role: string) => {
    if (!licenseFile) {
      setMessage("Please upload license before requesting role");
      return;
    }

    setLoading(true);
    setMessage(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      setMessage("User not authenticated");
      return;
    }

    /* 1️⃣ Upload license to Supabase Storage */
    const filePath = `${user.id}/${Date.now()}-${licenseFile.name}`;

    const { error: uploadError } = await supabase.storage
      .from("licenses")
      .upload(filePath, licenseFile);

    if (uploadError) {
      setLoading(false);
      setMessage("License upload failed");
      return;
    }

    /* 2️⃣ Get public URL */
    const { data } = supabase.storage
      .from("licenses")
      .getPublicUrl(filePath);

    /* 3️⃣ Insert role request */
    const { error } = await supabase.from("role_requests").insert({
      user_id: user.id,
      requested_role: role,
      license_url: data.publicUrl,
      status: "pending",
    });

    setLoading(false);

    if (error) {
      setMessage("Failed to send role request");
    } else {
      setMessage("Role request sent with license for verification");
      setLicenseFile(null);
    }
  };

  if (!profile) return <p>Loading...</p>;

  return (
    <div className="profile-card">
      <h2>Customer Dashboard</h2>

      <p><b>Name:</b> {profile.first_name} {profile.last_name}</p>
      <p><b>Current Role:</b> {profile.role}</p>

      <hr />

      <h3>Upload License</h3>
      <input
        type="file"
        accept="image/*,.pdf"
        onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
      />

      <h3 style={{ marginTop: "15px" }}>Request Role</h3>

      <button
        className="action-btn"
        disabled={loading}
        onClick={() => requestRole("driver")}
      >
        Request Driver Role
      </button>

      <button
        className="action-btn"
        disabled={loading}
        onClick={() => requestRole("owner")}
      >
        Request Owner Role
      </button>

      {message && <p style={{ marginTop: "10px" }}>{message}</p>}
    </div>
  );
}