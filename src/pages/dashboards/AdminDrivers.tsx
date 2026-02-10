import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminDrivers() {
  const [drivers, setDrivers] = useState<any[]>([]);

  useEffect(() => {
    loadDrivers();
  }, []);

  async function loadDrivers() {
    const { data } = await supabase
      .from("profiles")
      .select("user_id, username, email")
      .eq("is_driver", true);

    setDrivers(data || []);
  }

  return (
    <div className="admin-page">
      <h2>Drivers</h2>

      {drivers.length === 0 && <p>No drivers registered.</p>}

      {drivers.map((d) => (
        <div key={d.user_id} className="card">
          <p><b>Username:</b> {d.username}</p>
          <p><b>Email:</b> {d.email}</p>
          <p><b>Status:</b> Approved Driver</p>
        </div>
      ))}
    </div>
  );
}