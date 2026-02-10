import React, { useState } from "react";
import { supabase } from "../lib/supabase";

type Props = {
  targetId: string;
  targetType: "vehicle" | "driver";
  onClose: () => void;
};

const RateReportModal: React.FC<Props> = ({
  targetId,
  targetType,
  onClose,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  async function submitRating() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from("ratings").insert({
      user_id: user.id,
      target_id: targetId,
      target_type: targetType,
      rating,
      comment,
    });

    setMessage("Rating submitted successfully");
  }

  async function submitReport() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from("reports").insert({
      reported_by: user.id,
      target_id: targetId,
      target_type: targetType,
      reason,
    });

    setMessage("Report submitted successfully");
  }

  return (
    <div className="card">
      <h3>Rate & Report</h3>

      <label>Rating</label>
      <select
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>

      <textarea
        placeholder="Optional comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <button onClick={submitRating}>Submit Rating</button>

      <hr />

      <textarea
        placeholder="Report reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />

      <button onClick={submitReport}>Submit Report</button>

      <button onClick={onClose} style={{ marginLeft: "10px" }}>
        Close
      </button>

      {message && <p>{message}</p>}
    </div>
  );
};

export default RateReportModal;