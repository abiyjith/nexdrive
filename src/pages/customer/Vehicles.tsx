import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import VehicleBookingModal from "../../components/VehicleBookingModal";

type Vehicle = {
  id: string;
  brand: string;
  model: string;
  vehicle_type: string;
  year: number;
  price_per_day: number;
  location_text: string;
  image_url?: string | null;
};

export default function CustomerVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    loadVehicles();
  }, []);

  async function loadVehicles() {
    const { data } = await supabase
      .from("vehicles")
      .select("*")
      .eq("verification_status", "approved")
      .eq("is_available", true);

    setVehicles(data || []);
    setLoading(false);
  }

  if (loading) return <p>Loading vehicles...</p>;

  return (
    <div className="page">
      <h2>🚗 Available Vehicles</h2>

      {vehicles.length === 0 && (
        <div className="alert info">No vehicles available.</div>
      )}

      <div className="grid">
        {vehicles.map((v) => (
          <div key={v.id} className="card">
            {v.image_url && (
              <img
                src={
                  supabase.storage
                    .from("vehicle-images")
                    .getPublicUrl(v.image_url).data.publicUrl
                }
                alt="Vehicle"
                style={{
                  width: "100%",
                  height: "180px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  marginBottom: "10px",
                }}
              />
            )}

            <h3>
              {v.brand} {v.model}
            </h3>

            <p><b>Type:</b> {v.vehicle_type}</p>
            <p><b>Year:</b> {v.year}</p>
            <p><b>Location:</b> {v.location_text}</p>
            <p><b>₹ {v.price_per_day}</b> / day</p>

            <button onClick={() => setActiveVehicle(v)}>
              Book Vehicle
            </button>
          </div>
        ))}
      </div>

      {activeVehicle && (
        <VehicleBookingModal
          vehicleId={activeVehicle.id}
          vehicleName={`${activeVehicle.brand} ${activeVehicle.model}`}
          pricePerDay={activeVehicle.price_per_day}
          onClose={() => setActiveVehicle(null)}
          onBooked={() => {
            setActiveVehicle(null);
            loadVehicles();
          }}
        />
      )}
    </div>
  );
}