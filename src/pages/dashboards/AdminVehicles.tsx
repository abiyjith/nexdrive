import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminVehicles() {
  const [vehicles, setVehicles] = useState<any[]>([]);

  useEffect(() => {
    loadVehicles();
  }, []);

  async function loadVehicles() {
    const { data } = await supabase
      .from("vehicles")
      .select("*")
      .eq("verification_status", "pending");

    setVehicles(data || []);
  }

  async function approve(id: string) {
    await supabase
      .from("vehicles")
      .update({ verification_status: "approved" })
      .eq("id", id);

    loadVehicles();
  }

  async function reject(id: string) {
    await supabase
      .from("vehicles")
      .update({ verification_status: "rejected" })
      .eq("id", id);

    loadVehicles();
  }

  return (
    <div className="admin-page">
      <h2>Vehicle RC Verification</h2>

      {vehicles.length === 0 && <p>No vehicles pending verification.</p>}

      {vehicles.map((v) => (
        <div key={v.id} className="card">
          <p><b>Vehicle:</b> {v.brand} {v.model}</p>
          <p><b>Number:</b> {v.vehicle_number}</p>

          <a
            href={supabase.storage
              .from("licenses")
              .getPublicUrl(v.rc_url).data.publicUrl}
            target="_blank"
            rel="noreferrer"
          >
            View RC
          </a>

          <br /><br />

          <button onClick={() => approve(v.id)}>Approve</button>
          <button onClick={() => reject(v.id)}>Reject</button>
        </div>
      ))}
    </div>
  );
}