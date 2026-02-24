import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function BookingChat({ bookingId }: { bookingId: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    const { data } = await supabase
      .from("booking_messages")
      .select("*")
      .eq("booking_id", bookingId)
      .order("created_at");

    setMessages(data || []);
  };

  const sendMessage = async () => {
    if (!text.trim()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("booking_messages").insert({
      booking_id: bookingId,
      sender_id: user?.id,
      message: text,
    });

    setText("");
    loadMessages();
  };

  return (
    <div className="chat-box">
      <h4>Chat</h4>

      <div className="chat-messages">
        {messages.map((m) => (
          <p key={m.id}>
            <b>{m.sender_id.slice(0, 6)}:</b> {m.message}
          </p>
        ))}
      </div>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}