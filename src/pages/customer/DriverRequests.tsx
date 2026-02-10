import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function DriverRequests() {
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("driver_hires")
      .select("*")
      .eq("driver_id", user.id)
      .order("created_at", { ascending: false });

    setRequests(data || []);
  };

  const getDatesInRange = (start: string, end: string) => {
    const dates: string[] = [];
    let current = new Date(start);
    const last = new Date(end);

    while (current <= last) {
      dates.push(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const acceptHire = async (r: any) => {
    // 1️⃣ Accept hire
    await supabase
      .from("driver_hires")
      .update({ status: "accepted" })
      .eq("id", r.id);

    // 2️⃣ Remove availability for hired dates
    const dates = getDatesInRange(r.start_date, r.end_date);

    await supabase
      .from("driver_availability")
      .delete()
      .eq("driver_id", r.driver_id)
      .in("available_date", dates);

    load();
  };

  const rejectHire = async (id: string) => {
    await supabase
      .from("driver_hires")
      .update({ status: "rejected" })
      .eq("id", id);

    load();
  };

  return (
    <div className="profile-card">
      <h2>Hire Requests</h2>

      {requests.length === 0 && <p>No hire requests.</p>}

      {requests.map((r) => (
        <div key={r.id} className="profile-card">
          <p><b>From:</b> {r.start_date}</p>
          <p><b>To:</b> {r.end_date}</p>
          <p><b>Status:</b> {r.status}</p>

          {r.status === "pending" && (
            <>
              <button onClick={() => acceptHire(r)}>Accept</button>
              <button onClick={() => rejectHire(r.id)}>Reject</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}