import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function DriverProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [driver, setDriver] = useState<any>(null);
  const [availability, setAvailability] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  const [experience, setExperience] = useState("");
  const [price, setPrice] = useState("");
  const [locationText, setLocationText] = useState("");

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setProfile(profileData);

      // Driver table
      const { data: driverData } = await supabase
        .from("drivers")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();

      setDriver(driverData);

      if (driverData) {
        setExperience(driverData.experience_years.toString());
        setPrice(driverData.price_per_day.toString());
        setLocationText(driverData.location_text || "");
      }

      // Availability
      const { data: avail } = await supabase
        .from("driver_availability")
        .select("available_date")
        .eq("driver_id", user.id)
        .order("available_date");

      setAvailability(avail?.map((a) => a.available_date) || []);
    };

    load();
  }, []);

  /* ================= SAVE / UPDATE ================= */
  const saveProfile = async () => {
    if (!profile) return;

    // If driver row doesn't exist, create it
    if (!driver) {
      await supabase.from("drivers").insert({
        owner_id: profile.user_id,
        name: `${profile.first_name} ${profile.last_name}`,
        license_number: "PENDING",
        experience_years: Number(experience),
        price_per_day: Number(price),
        location_text: locationText,
      });
    } else {
      await supabase
        .from("drivers")
        .update({
          experience_years: Number(experience),
          price_per_day: Number(price),
          location_text: locationText,
        })
        .eq("id", driver.id);
    }

    setMessage("Profile updated successfully");
  };

  if (!profile) return null;

  return (
    <div className="driver-card">
      <h2>Driver Profile</h2>

      <p>
        <b>Name:</b> {profile.first_name} {profile.last_name}
      </p>
      <p>
        <b>Email:</b> {profile.email}
      </p>

      <hr />

      <h4>Professional Details</h4>

      <label>Experience (years)</label>
      <input
        type="number"
        value={experience}
        onChange={(e) => setExperience(e.target.value)}
      />

      <label>Price per day (₹)</label>
      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      <label>Current Location</label>
      <input
        type="text"
        placeholder="Eg: Chennai, Coimbatore"
        value={locationText}
        onChange={(e) => setLocationText(e.target.value)}
      />

      <button className="primary-btn" onClick={saveProfile}>
        Save Profile
      </button>

      {message && <p className="info-text">{message}</p>}

      <hr />

      <h4>Availability Dates</h4>

      {availability.length === 0 && <p>No dates added yet</p>}

      <ul>
        {availability.map((d) => (
          <li key={d}>{d}</li>
        ))}
      </ul>
    </div>
  );
}