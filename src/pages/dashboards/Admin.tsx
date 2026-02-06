import { supabase } from "../../lib/supabase";
import { useEffect, useState } from "react";
import DashboardNavbar from "../../components/DashboardNavbar";

export default function AdminDashboard() {
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from("role_requests")
      .select("*")
      .eq("status", "pending")
      .then(({ data }) => setRequests(data || []));
  }, []);

  const approve = async (r: any) => {
    await supabase
      .from("profiles")
      .update({ role: r.requested_role })
      .eq("user_id", r.user_id);

    await supabase
      .from("role_requests")
      .update({ status: "approved" })
      .eq("id", r.id);

    setRequests(requests.filter((x) => x.id !== r.id));
  };

  return (
    <>
      <DashboardNavbar role="admin" />
      <div style={{ padding: 24 }}>
        <h2>Admin Dashboard</h2>
        {requests.map((r) => (
          <div key={r.id}>
            {r.requested_role}
            <button onClick={() => approve(r)}>Approve</button>
          </div>
        ))}
      </div>
    </>
  );
}