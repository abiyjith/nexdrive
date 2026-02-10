import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { getProfile } from "../../lib/getProfile";

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const data = await getProfile();
    setProfile(data);
  }

  async function uploadPhoto() {
    if (!photo || !profile) return;

    const path = `${profile.user_id}.jpg`;

    await supabase.storage
      .from("profile-photos")
      .upload(path, photo, { upsert: true });

    await supabase
      .from("profiles")
      .update({ profile_photo: path })
      .eq("user_id", profile.user_id);

    setMessage("Profile photo updated");
    loadProfile();
  }

  if (!profile) return <p>Loading...</p>;

  return (
    <div className="profile-card">
      <h2>Profile</h2>

      {profile.profile_photo && (
        <img
          src={
            supabase.storage
              .from("profile-photos")
              .getPublicUrl(profile.profile_photo).data.publicUrl
          }
          alt="Profile"
          width={120}
        />
      )}

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setPhoto(e.target.files?.[0] || null)}
      />
      <button onClick={uploadPhoto}>Upload Photo</button>

      {message && <p>{message}</p>}
    </div>
  );
}