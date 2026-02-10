import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AddVehicle() {
  const [form, setForm] = useState({
    vehicle_type: "",
    brand: "",
    model: "",
    year: "",
    vehicle_number: "",
    price_per_day: "",
    location_text: "",
    latitude: "",
    longitude: "",
  });

  const [rcFile, setRcFile] = useState<File | null>(null);
  const [vehicleImage, setVehicleImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  /* ================= AUTO LOCATION ================= */
  function detectLocation() {
    if (!navigator.geolocation) {
      setMessage("Geolocation not supported");
      return;
    }

    setMessage("Detecting location...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm({
          ...form,
          latitude: pos.coords.latitude.toString(),
          longitude: pos.coords.longitude.toString(),
        });
        setMessage("Location detected");
      },
      () => setMessage("Location permission denied")
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !rcFile) {
      setMessage("Missing required data");
      setLoading(false);
      return;
    }

    const { data: vehicle, error } = await supabase
      .from("vehicles")
      .insert({
        owner_id: user.id,
        vehicle_type: form.vehicle_type,
        brand: form.brand,
        model: form.model,
        year: Number(form.year),
        vehicle_number: form.vehicle_number.toUpperCase(),
        price_per_day: Number(form.price_per_day),
        location_text: form.location_text,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        verification_status: "pending",
      })
      .select()
      .single();

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    /* Upload RC */
    const rcPath = `${user.id}/vehicle-${vehicle.id}-rc`;
    await supabase.storage
      .from("licenses")
      .upload(rcPath, rcFile, { upsert: true });

    /* Upload image */
    if (vehicleImage) {
      const imgPath = `vehicle-${vehicle.id}.jpg`;
      await supabase.storage
        .from("vehicle-images")
        .upload(imgPath, vehicleImage, { upsert: true });

      await supabase
        .from("vehicles")
        .update({ image_url: imgPath })
        .eq("id", vehicle.id);
    }

    await supabase
      .from("vehicles")
      .update({ rc_url: rcPath })
      .eq("id", vehicle.id);

    setMessage("Vehicle added. Waiting for admin approval.");
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="profile-card">
      <h2>Add Vehicle</h2>

      {Object.keys(form).map((key) => (
        <input
          key={key}
          placeholder={key.replace("_", " ").toUpperCase()}
          value={(form as any)[key]}
          onChange={(e) =>
            setForm({ ...form, [key]: e.target.value })
          }
          required={key !== "latitude" && key !== "longitude"}
        />
      ))}

      <button type="button" onClick={detectLocation}>
        📍 Use Current Location
      </button>

      <input
        type="file"
        accept="image/*"
        onChange={(e) =>
          setVehicleImage(e.target.files?.[0] || null)
        }
      />

      <input
        type="file"
        accept=".jpg,.png,.pdf"
        onChange={(e) => setRcFile(e.target.files?.[0] || null)}
        required
      />

      <button disabled={loading}>
        {loading ? "Uploading..." : "Add Vehicle"}
      </button>

      {message && <p>{message}</p>}
    </form>
  );
}