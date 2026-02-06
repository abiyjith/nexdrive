import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      setProfile(data);
    };
    loadProfile();
  }, [user]);

  const requestRoleChange = async (role: string) => {
    setRequesting(true);
    await supabase.from("role_requests").insert({
      user_id: user.id,
      requested_role: role,
    });
    setRequesting(false);
    alert("Request sent to admin");
  };

  if (!profile) return null;

  return (
    <div style={{ padding: 24 }}>
      <h2>Customer Dashboard</h2>

      <p><b>Name:</b> {profile.first_name} {profile.last_name}</p>
      <p><b>Username:</b> {profile.username}</p>
      <p><b>Email:</b> {profile.email}</p>
      <p><b>Role:</b> {profile.role}</p>

      <h3>Request Role Upgrade</h3>
      <button onClick={() => requestRoleChange("owner")} disabled={requesting}>
        Become Owner
      </button>
      <button onClick={() => requestRoleChange("driver")} disabled={requesting}>
        Become Driver
      </button>

      <br /><br />
      <button onClick={logout}>Logout</button>
    </div>
  );
}