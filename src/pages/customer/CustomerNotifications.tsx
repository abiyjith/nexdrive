import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function CustomerNotifications() {
  const [hires, setHires] = useState<any[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const today = new Date().toISOString().split("T")[0];

    const { data } = await supabase
      .from("driver_hires")
      .select("*")
      .eq("customer_id", user.id)
      .eq("status", "accepted")
      .lt("end_date", today); // ✅ only after hire ends

    setHires(data || []);
  };

  const submitRating = async (hire: any) => {
    const rating = ratings[hire.id];
    if (rating === undefined) return;

    await supabase.from("driver_reviews").insert({
      driver_id: hire.driver_id,
      customer_id: hire.customer_id,
      rating,
    });

    await supabase
      .from("driver_hires")
      .update({ status: "completed" })
      .eq("id", hire.id);

    load();
  };

  return (
    <div className="profile-card">
      <h2>Rate Completed Hires</h2>

      {hires.length === 0 && (
        <p>No completed hires available for rating.</p>
      )}

      {hires.map((h) => (
        <div key={h.id} className="profile-card">
          <p><b>Driver:</b> {h.driver_id}</p>
          <p><b>From:</b> {h.start_date}</p>
          <p><b>To:</b> {h.end_date}</p>

          <label>Rating (0–5):</label>
          <input
            type="number"
            min="0"
            max="5"
            value={ratings[h.id] ?? ""}
            onChange={(e) =>
              setRatings({
                ...ratings,
                [h.id]: Number(e.target.value),
              })
            }
          />

          <button onClick={() => submitRating(h)}>
            Submit Rating
          </button>
        </div>
      ))}
    </div>
  );
}