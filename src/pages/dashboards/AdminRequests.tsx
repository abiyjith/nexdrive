import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type RoleRequest = {
  id: string;
  user_id: string;
  requested_role: "driver" | "owner";
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
  license_url: string | null;
  profiles: {
    username: string;
    email: string;
  } | null;
};

export default function AdminRequests() {
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});

 const loadRequests = async () => {
  const { data, error } = await supabase
    .from("role_requests")
    .select(`
      id,
      user_id,
      requested_role,
      status,
      admin_note,
      license_url,
      profiles (
        username,
        email
      )
    `)
    .returns<RoleRequest[]>()
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading role requests:", error);
    setRequests([]);
    return;
  }

  setRequests(data ?? []);
};

  useEffect(() => {
    loadRequests();
  }, []);

  const approveRequest = async (req: RoleRequest) => {
  // 1️⃣ mark request approved
  await supabase
    .from("role_requests")
    .update({ status: "approved", admin_note: null })
    .eq("id", req.id);

  // 2️⃣ update profile
  await supabase
    .from("profiles")
    .update({ is_driver: true })
    .eq("user_id", req.user_id);

  // 3️⃣ ensure drivers row exists
  const { data: existingDriver } = await supabase
    .from("drivers")
    .select("id")
    .eq("owner_id", req.user_id)
    .maybeSingle();

  if (!existingDriver) {
    await supabase.from("drivers").insert({
      owner_id: req.user_id,
      name: "Not set",
      license_number: "PENDING",
      experience_years: 0,
      price_per_day: 0,
      available: false,
      verified: true
    });
  }

  loadRequests();
};

  const rejectRequest = async (req: RoleRequest) => {
    const note = noteMap[req.id] || "Request rejected";

    await supabase
      .from("role_requests")
      .update({
        status: "rejected",
        admin_note: note,
      })
      .eq("id", req.id);

    loadRequests();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ color: "#facc15" }}>Role Requests</h2>

      {requests.length === 0 && <p>No requests found.</p>}

      {requests.map((r) => (
        <div
          key={r.id}
          style={{
            border: "1px solid #444",
            borderRadius: "8px",
            padding: "12px",
            marginBottom: "12px",
            background: "#111",
          }}
        >
          <p><b>User:</b> {r.profiles?.username}</p>
          <p><b>Email:</b> {r.profiles?.email}</p>
          <p><b>Requested Role:</b> {r.requested_role}</p>
          <p><b>Status:</b> {r.status}</p>

          {r.license_url && (
            <p>
              <a
                href={r.license_url}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#facc15" }}
              >
                View License
              </a>
            </p>
          )}

          {r.status === "pending" && (
            <>
              <textarea
                placeholder="Admin note (optional)"
                value={noteMap[r.id] || ""}
                onChange={(e) =>
                  setNoteMap({ ...noteMap, [r.id]: e.target.value })
                }
                style={{
                  width: "100%",
                  marginTop: "8px",
                  padding: "6px",
                  background: "#000",
                  color: "#fff",
                  border: "1px solid #555",
                  borderRadius: "6px",
                }}
              />

              <div style={{ marginTop: "10px" }}>
                <button
                  onClick={() => approveRequest(r)}
                  style={{
                    marginRight: "10px",
                    padding: "6px 14px",
                    background: "#16a34a",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Approve
                </button>

                <button
                  onClick={() => rejectRequest(r)}
                  style={{
                    padding: "6px 14px",
                    background: "#dc2626",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Reject
                </button>
              </div>
            </>
          )}

          {r.status === "rejected" && r.admin_note && (
            <p style={{ color: "#f87171" }}>
              <b>Admin Note:</b> {r.admin_note}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}