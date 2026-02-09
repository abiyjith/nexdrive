import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminRequests() {
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const { data } = await supabase
      .from("role_requests")
      .select("*")
      .eq("status", "pending");
    setRequests(data || []);
  };

  const approve = async (r: any) => {
    await supabase.from("profiles")
      .update({ role: r.requested_role })
      .eq("user_id", r.user_id);

    await supabase.from("role_requests")
      .update({ status: "approved" })
      .eq("id", r.id);

    load();
  };

  const reject = async (id: string) => {
    await supabase.from("role_requests")
      .update({ status: "rejected" })
      .eq("id", id);
    load();
  };

  return (
    <>
      <h2>Role Change Requests</h2>

      {requests.map(r => (
        <div key={r.id} className="profile-card">
          <p><b>User:</b> {r.user_id}</p>
          <p><b>Requested:</b> {r.requested_role}</p>
          <a href={r.license_url} target="_blank">View License</a>
          <br /><br />
          <button onClick={() => approve(r)}>Approve</button>
          <button onClick={() => reject(r.id)}>Reject</button>
        </div>
      ))}

      {requests.length === 0 && <p>No pending requests</p>}
    </>
  );
}