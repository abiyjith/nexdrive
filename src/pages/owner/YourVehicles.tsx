import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function YourVehicles() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) {
      setVehicles(data || []);
    }

    setLoading(false);
  };

  if (loading) return <p>Loading vehicles...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ color: "#facc15" }}>Your Vehicles</h2>

      {vehicles.length === 0 && <p>No vehicles added yet</p>}

      <div style={{ display: "grid", gap: 20 }}>
        {vehicles.map((v) => (
          <div key={v.id} className="vehicle-card">
            {v.image_url && (
              <img
                src={
                  supabase.storage
                    .from("vehicle-images")
                    .getPublicUrl(v.image_url).data.publicUrl
                }
                alt="vehicle"
                style={{
                  width: "100%",
                  height: 180,
                  objectFit: "cover",
                  borderRadius: 8,
                }}
              />
            )}

            <h3>
              {v.brand} {v.model}
            </h3>

            <p>
              <b>₹{v.price_per_day}</b> / day
            </p>

            <p>
              <b>Vehicle No:</b> {v.vehicle_number}
            </p>

            <p>
              <b>Status:</b>{" "}
              <span
                style={{
                  color:
                    v.verification_status === "approved"
                      ? "lightgreen"
                      : v.verification_status === "rejected"
                      ? "red"
                      : "#facc15",
                }}
              >
                {v.verification_status}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}