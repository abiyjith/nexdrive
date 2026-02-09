import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminDrivers() {
  const [drivers, setDrivers] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("profiles")
      .select("*")
      .eq("role", "driver")
      .then(({ data }) => setDrivers(data || []));
  }, []);

  return (
    <>
      <h2>Drivers</h2>
      {drivers.map(d => (
        <div key={d.user_id} className="profile-card">
          <p>{d.username}</p>
          <p>{d.email}</p>
        </div>
      ))}
    </>
  );
}