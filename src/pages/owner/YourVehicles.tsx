import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function YourVehicles() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVehicles = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      // ✅ STEP 7: CRITICAL FILTER
      const { data } = await supabase
        .from("vehicles")
        .select("*")
        .eq("owner_id", userData.user.id);

      setVehicles(data || []);
      setLoading(false);
    };

    loadVehicles();
  }, []);

  if (loading) return null;

  return (
    <div>
      <h2>Your Vehicles</h2>

      {vehicles.length === 0 && <p>No vehicles added yet</p>}

      {vehicles.map((v) => (
        <div key={v.id} className="vehicle-card">
          <h4>{v.vehicle_name}</h4>
          <p>{v.price_per_day}/day</p>
          <p>Status: {v.status}</p>
        </div>
      ))}
    </div>
  );
}