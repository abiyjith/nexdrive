import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getProfile } from "../../lib/getProfile";

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    getProfile(user.id).then(setProfile);
  }, [user]);

  if (!profile) return null;

  return (
    <div style={{ padding: 40 }}>
      <h1>Owner Dashboard</h1>

      <h3>Your Profile</h3>
      <p>{profile.first_name} {profile.last_name}</p>
      <p>Username: {profile.username}</p>
      <p>Email: {profile.email}</p>
      <p>Role: {profile.role}</p>
    </div>
  );
}