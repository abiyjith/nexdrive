import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Message = {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
};

export default function ChatBox({
  hireId,
  otherUserId,
}: {
  hireId: string;
  otherUserId: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [userId, setUserId] = useState<string>("");

  /* ================= LOAD USER ================= */
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, []);

  /* ================= LOAD MESSAGES ================= */
  const loadMessages = async () => {
    const { data } = await supabase
      .from("chats")
      .select("*")
      .eq("hire_id", hireId)
      .order("created_at", { ascending: true });

    setMessages(data || []);
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000); // polling
    return () => clearInterval(interval);
  }, []);

  /* ================= SEND MESSAGE ================= */
  const sendMessage = async () => {
    if (!text.trim()) return;

    await supabase.from("chats").insert({
      hire_id: hireId,
      sender_id: userId,
      receiver_id: otherUserId,
      message: text,
    });

    setText("");
    loadMessages();
  };

  return (
    <div className="chat-box">
      <div className="chat-messages">
        {messages.map((m) => (
          <div
            key={m.id}
            className={
              m.sender_id === userId ? "chat-msg self" : "chat-msg other"
            }
          >
            {m.message}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}