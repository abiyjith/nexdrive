import { useEffect, useState } from "react";
import { getProfile } from "../../lib/getProfile";

interface ProfileType {
  first_name: string | null;
  last_name: string | null;
  username: string;
  email: string;
  role: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      const data = await getProfile();
      setProfile(data);
      setLoading(false);
    }

    fetchProfile();
  }, []);

  if (loading) {
    return <p>Loading profile...</p>;
  }

  if (!profile) {
    return <p>Unable to load profile.</p>;
  }

  return (
    <div className="profile-card">
      <h2>My Profile</h2>

      <p>
        <b>Name:</b> {profile.first_name} {profile.last_name}
      </p>
      <p>
        <b>Username:</b> {profile.username}
      </p>
      <p>
        <b>Email:</b> {profile.email}
      </p>
      <p>
        <b>Role:</b> {profile.role}
      </p>
    </div>
  );
}