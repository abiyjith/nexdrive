import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import RateReportModal from "../../components/RateReportModal";

export default function CustomerHistory() {
  const [vehicleHistory, setVehicleHistory] = useState<any[]>([]);
  const [driverHistory, setDriverHistory] = useState<any[]>([]);
  const [activeTarget, setActiveTarget] = useState<{
    id: string;
    type: "vehicle" | "driver";
  } | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: vehicles } = await supabase
      .from("vehicle_bookings")
      .select(`
        id,
        end_date,
        status,
        vehicles (id, brand, model)
      `)
      .eq("customer_id", user.id);

    setVehicleHistory(vehicles || []);

    const { data: drivers } = await supabase
      .from("driver_hires")
      .select(`
        id,
        end_date,
        status,
        profiles (user_id, first_name, last_name)
      `)
      .eq("customer_id", user.id);

    setDriverHistory(drivers || []);
  }

  function canRate(endDate: string, status: string) {
    const today = new Date().toISOString().split("T")[0];
    return status === "accepted" && endDate < today;
  }

  return (
    <div>
      <h2>Your History</h2>

      <h3>Vehicles</h3>
      {vehicleHistory.map((v) => (
        <div key={v.id} className="card">
          <p>
            {v.vehicles.brand} {v.vehicles.model}
          </p>
          <p>Status: {v.status}</p>

          {canRate(v.end_date, v.status) && (
            <button
              onClick={() =>
                setActiveTarget({
                  id: v.vehicles.id,
                  type: "vehicle",
                })
              }
            >
              ⭐ Rate / 🚩 Report
            </button>
          )}
        </div>
      ))}

      <h3>Drivers</h3>
      {driverHistory.map((d) => (
        <div key={d.id} className="card">
          <p>
            {d.profiles.first_name} {d.profiles.last_name}
          </p>
          <p>Status: {d.status}</p>

          {canRate(d.end_date, d.status) && (
            <button
              onClick={() =>
                setActiveTarget({
                  id: d.profiles.user_id,
                  type: "driver",
                })
              }
            >
              ⭐ Rate / 🚩 Report
            </button>
          )}
        </div>
      ))}

      {activeTarget && (
        <RateReportModal
          targetId={activeTarget.id}
          targetType={activeTarget.type}
          onClose={() => setActiveTarget(null)}
        />
      )}
    </div>
  );
}