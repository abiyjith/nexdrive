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

  /* ================= USE CURRENT LOCATION ================= */
  const detectLocation = () => {
    if (!navigator.geolocation) {
      setMessage("Geolocation not supported");
      return;
    }

    setMessage("Detecting location...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        setForm({
          ...form,
          latitude: lat.toString(),
          longitude: lng.toString(),
          location_text: `Lat ${lat.toFixed(5)}, Lng ${lng.toFixed(5)}`,
        });

        setMessage("Location detected successfully");
      },
      () => setMessage("Location permission denied")
    );
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !rcFile || !form.latitude) {
      setMessage("Please complete all required fields");
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

    /* RC UPLOAD */
    const rcPath = `${user.id}/vehicle-${vehicle.id}-rc`;
    await supabase.storage
      .from("licenses")
      .upload(rcPath, rcFile, { upsert: true });

    /* VEHICLE IMAGE UPLOAD */
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

    setMessage("Vehicle added successfully. Awaiting admin approval.");
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="profile-card">
      <h2>Add Vehicle</h2>

      <input
        placeholder="Vehicle Type (Car / Bike)"
        value={form.vehicle_type}
        onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })}
        required
      />

      <input
        placeholder="Brand (Honda, Hyundai...)"
        value={form.brand}
        onChange={(e) => setForm({ ...form, brand: e.target.value })}
        required
      />

      <input
        placeholder="Model"
        value={form.model}
        onChange={(e) => setForm({ ...form, model: e.target.value })}
        required
      />

      <input
        placeholder="Year"
        type="number"
        value={form.year}
        onChange={(e) => setForm({ ...form, year: e.target.value })}
        required
      />

      <input
        placeholder="Vehicle Number (TN09AB1234)"
        value={form.vehicle_number}
        onChange={(e) =>
          setForm({ ...form, vehicle_number: e.target.value })
        }
        required
      />

      <input
        placeholder="Price Per Day (₹)"
        type="number"
        value={form.price_per_day}
        onChange={(e) =>
          setForm({ ...form, price_per_day: e.target.value })
        }
        required
      />

      {/* LOCATION */}
      <div className="upload-group">
        <label className="upload-label">Vehicle Location</label>
        <p className="upload-hint">
          Used to show your vehicle to nearby customers
        </p>

        <button type="button" onClick={detectLocation}>
          📍 Use Current Location
        </button>

        {form.location_text && (
          <p style={{ marginTop: 6 }}>{form.location_text}</p>
        )}
      </div>

      {/* MAP PREVIEW */}
      {form.latitude && (
        <iframe
          title="map"
          width="100%"
          height="220"
          style={{ borderRadius: 8, marginTop: 10 }}
          src={`https://maps.google.com/maps?q=${form.latitude},${form.longitude}&z=15&output=embed`}
        />
      )}

      {/* VEHICLE IMAGE */}
      <div className="upload-group">
        <label className="upload-label">Vehicle Photo</label>
        <p className="upload-hint">Shown to customers</p>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setVehicleImage(e.target.files?.[0] || null)}
        />
      </div>

      {/* RC */}
      <div className="upload-group">
        <label className="upload-label">RC Document</label>
        <p className="upload-hint">For admin verification</p>
        <input
          type="file"
          accept=".jpg,.png,.pdf"
          onChange={(e) => setRcFile(e.target.files?.[0] || null)}
          required
        />
      </div>

      <button disabled={loading}>
        {loading ? "Uploading..." : "Add Vehicle"}
      </button>

      {message && <p>{message}</p>}
    </form>
  );
}