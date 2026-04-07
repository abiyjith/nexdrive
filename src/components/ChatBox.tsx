import { useState, useEffect, useRef } from "react";
import { collection, addDoc, onSnapshot, query, where, orderBy, deleteDoc, doc, updateDoc, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { FaTimes, FaPaperPlane, FaImage, FaTrashAlt, FaEdit, FaShare, FaEllipsisV } from "react-icons/fa";
import Toast from "./Toast";

export default function ChatBox({ chatId, recipientName, onClose }: { chatId: string, recipientName: string, onClose: () => void }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [toast, setToast] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [prevMsgCount, setPrevMsgCount] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "chat_messages"),
      where("chatId", "==", chatId)
    );
    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map(d => {
        const data = d.data();
        let ts = data.timestamp;
        if (!ts && data.createdAt) {
          ts = data.createdAt.toMillis ? data.createdAt.toMillis() : new Date(data.createdAt).getTime();
        }
        return { id: d.id, ...data, timestamp: ts || 0 };
      });
      msgs.sort((a,b) => a.timestamp - b.timestamp);
      setMessages(msgs);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    return () => unsub();
  }, [chatId, user]);

  useEffect(() => {
    if (messages.length > prevMsgCount && prevMsgCount !== 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.senderId !== user?.uid) {
        const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
        audio.play().catch(e => console.log("Audio play blocked", e));
        setToast({ type: "info", message: "New message received!" });
      }
    }
    setPrevMsgCount(messages.length);
  }, [messages, prevMsgCount, user]);

  const handleSend = async () => {
    if (!newMessage.trim() && !editingId) return;
    if (!user) return;

    try {
      if (editingId) {
        await updateDoc(doc(db, "chat_messages", editingId), {
          text: editText,
          edited: true,
          updatedAt: new Date()
        });
        setEditingId(null);
        setEditText("");
      } else {
        await addDoc(collection(db, "chat_messages"), {
          chatId,
          senderId: user.uid,
          text: newMessage,
          timestamp: Date.now()
        });
        setNewMessage("");
      }
    } catch (e) {
      setToast({ type: "error", message: "Failed to send message" });
    }
  };

  const handleImageUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const storageRef = ref(storage, `chats/${chatId}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await addDoc(collection(db, "chat_messages"), {
        chatId,
        senderId: user.uid,
        imageUrl: url,
        timestamp: Date.now()
      });
    } catch (error) {
      setToast({ type: "error", message: "Image upload failed. Firebase Storage limits may be reached." });
    }
    setUploading(false);
  };

  const handleDelete = async (msgId: string) => {
    if (window.confirm("Delete this message?")) {
      await deleteDoc(doc(db, "chat_messages", msgId));
    }
  };

  const handleForward = (text: string) => {
    navigator.clipboard.writeText(text);
    setToast({ type: "success", message: "Message copied to clipboard for forwarding!" });
  };

  const handleDeleteChat = async () => {
    if (!window.confirm("Are you sure you want to delete the entire chat history for this booking?")) return;
    try {
      const snap = await getDocs(query(collection(db, "chat_messages"), where("chatId", "==", chatId)));
      const batch = snap.docs.map(d => deleteDoc(d.ref));
      await Promise.all(batch);
      setToast({ type: "success", message: "Chat deleted" });
      onClose();
    } catch (e) {
      setToast({ type: "error", message: "Failed to delete chat" });
    }
  };

  return (
    <motion.div 
      className="chatbox-wrapper"
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
    >
      <div className="chatbox-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="chatbox-avatar">{recipientName.charAt(0)}</div>
          <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-main)' }}>{recipientName}</h3>
        </div>
        <div style={{ display: 'flex', gap: '15px', position: 'relative' }}>
          <button className="chat-icon-btn" onClick={() => setMenuOpen(!menuOpen)}>
            <FaEllipsisV />
          </button>
          <button className="chat-icon-btn" onClick={onClose}>
            <FaTimes />
          </button>
          
          {menuOpen && (
            <div className="chat-menu">
              <button onClick={handleDeleteChat} className="chat-menu-item text-danger">
                <FaTrashAlt /> Delete Chat
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="chatbox-messages">
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>
            <p>No messages yet. Say hi to {recipientName}!</p>
          </div>
        )}
        {messages.map((m) => {
          const isMine = m.senderId === user?.uid;
          return (
            <div key={m.id} className={`chat-msg-row ${isMine ? 'mine' : 'theirs'}`}>
              <div className="chat-msg-bubble">
                {m.imageUrl && <img src={m.imageUrl} alt="attached" className="chat-img" />}
                {m.text && <p>{m.text}</p>}
                {m.edited && <span className="edited-tag">(edited)</span>}
                
                <div className="msg-actions">
                  {m.text && <button title="Forward (Copy)" onClick={() => handleForward(m.text)}><FaShare /></button>}
                  {isMine && m.text && <button title="Edit" onClick={() => { setEditingId(m.id); setEditText(m.text); }}><FaEdit /></button>}
                  {isMine && <button title="Delete" onClick={() => handleDelete(m.id)}><FaTrashAlt /></button>}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="chatbox-input-area">
        {editingId && (
          <div className="editing-bar">
            <span>Editing message...</span>
            <button onClick={() => { setEditingId(null); setEditText(""); }}><FaTimes /></button>
          </div>
        )}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label className="chat-icon-btn" title="Upload Image" style={{ cursor: 'pointer' }}>
            <FaImage />
            <input type="file" hidden accept="image/*" onChange={handleImageUpload} disabled={uploading} />
          </label>
          <input 
            type="text" 
            className="chat-input" 
            placeholder={editingId ? "Edit your message..." : "Type a message..."} 
            value={editingId ? editText : newMessage}
            onChange={e => editingId ? setEditText(e.target.value) : setNewMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            disabled={uploading}
            style={{ color: 'var(--text-main)' }}
          />
          <button className="chat-send-btn" onClick={handleSend} disabled={uploading || (!newMessage.trim() && !editText.trim())}>
            {uploading ? "..." : <FaPaperPlane />}
          </button>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </motion.div>
  );
}
