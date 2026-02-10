import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [stats, setStats] = useState({
    users: 0,
    drivers: 0,
    owners: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);

    // Fetch stats
    const { count: users } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const { count: drivers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_driver", true);

    const { count: owners } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_owner", true);

    const { count: pending } = await supabase
      .from("role_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    setStats({
      users: users || 0,
      drivers: drivers || 0,
      owners: owners || 0,
      pending: pending || 0,
    });

    // Fetch pending requests
    const { data } = await supabase
      .from("role_requests")
      .select("*")
      .eq("status", "pending");

    setRequests(data || []);
    setLoading(false);
  };

  const approve = async (r: any) => {
    const updates: any = {};

    if (r.requested_role === "driver") {
      updates.is_driver = true;
      updates.active_role = "driver";
    }

    if (r.requested_role === "owner") {
      updates.is_owner = true;
      updates.active_role = "owner";
    }

    await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", r.user_id);

    await supabase
      .from("role_requests")
      .update({ status: "approved" })
      .eq("id", r.id);

    loadAll();
  };

  const reject = async (id: string) => {
    await supabase
      .from("role_requests")
      .update({ status: "rejected" })
      .eq("id", id);

    loadAll();
  };

  return (
    <>
      <h2>Admin Dashboard</h2>

      {/* ================= ANALYTICS ================= */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
        <div className="profile-card">👥 Users<br /><b>{stats.users}</b></div>
        <div className="profile-card">🚗 Drivers<br /><b>{stats.drivers}</b></div>
        <div className="profile-card">🏠 Owners<br /><b>{stats.owners}</b></div>
        <div className="profile-card">⏳ Pending Requests<br /><b>{stats.pending}</b></div>
      </div>

      {/* ================= REQUESTS ================= */}
      <h3>Role Change Requests</h3>

      {loading && <p>Loading...</p>}

      {!loading && requests.length === 0 && (
        <p>No pending role requests.</p>
      )}

      {requests.map((r) => (
        <div key={r.id} className="profile-card">
          <p><b>User ID:</b> {r.user_id}</p>
          <p><b>Requested Role:</b> {r.requested_role}</p>

          {r.license_url && (
            <p>
              <a href={r.license_url} target="_blank" rel="noreferrer">
                View License
              </a>
            </p>
          )}

          <button onClick={() => approve(r)}>Approve</button>
          <button onClick={() => reject(r.id)}>Reject</button>
        </div>
      ))}
    </>
  );
}