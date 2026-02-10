import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) setError("Failed to load reports");
    else setReports(data || []);

    setLoading(false);
  }

  async function banUser(id: string) {
    await supabase.from("profiles").update({ is_banned: true }).eq("user_id", id);
    setMessage("User banned successfully");
    loadReports();
  }

  async function unbanUser(id: string) {
    await supabase.from("profiles").update({ is_banned: false }).eq("user_id", id);
    setMessage("User unbanned successfully");
    loadReports();
  }

  async function deleteVehicle(id: string) {
    await supabase.from("vehicles").delete().eq("id", id);
    setMessage("Vehicle removed");
    loadReports();
  }

  async function resolveReport(id: string) {
    await supabase.from("reports").update({ status: "resolved" }).eq("id", id);
    setMessage("Report resolved");
    loadReports();
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div className="page">
      <h2>🚨 Reports & Violations</h2>

      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}

      {reports.length === 0 && (
        <div className="alert info">No reports available</div>
      )}

      {reports.map((r) => (
        <div key={r.id} className="card">
          <p><b>Type:</b> {r.target_type}</p>
          <p><b>Reason:</b> {r.reason}</p>
          <span className={`badge ${r.status}`}>{r.status}</span>

          <div style={{ marginTop: "12px" }}>
            {r.target_type === "user" && (
              <>
                <button className="danger" onClick={() => banUser(r.target_id)}>
                  Ban User
                </button>
                <button onClick={() => unbanUser(r.target_id)}>Unban</button>
              </>
            )}

            {r.target_type === "vehicle" && (
              <button className="danger" onClick={() => deleteVehicle(r.target_id)}>
                Delete Vehicle
              </button>
            )}

            {r.status !== "resolved" && (
              <button onClick={() => resolveReport(r.id)}>
                Mark Resolved
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}