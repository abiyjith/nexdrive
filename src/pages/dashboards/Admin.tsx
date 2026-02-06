import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminDashboard() {
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("role_requests")
        .select("*");
      setRequests(data || []);
    };
    load();
  }, []);

  const approve = async (req: any) => {
    await supabase
      .from("profiles")
      .update({ role: req.requested_role })
      .eq("user_id", req.user_id);

    await supabase
      .from("role_requests")
      .delete()
      .eq("id", req.id);

    setRequests(requests.filter(r => r.id !== req.id));
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Admin Dashboard</h2>

      {requests.map(r => (
        <div key={r.id}>
          <p>User: {r.user_id}</p>
          <p>Requested Role: {r.requested_role}</p>
          <button onClick={() => approve(r)}>Approve</button>
          <hr />
        </div>
      ))}
    </div>
  );
}