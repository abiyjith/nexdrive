import { useEffect, useState } from "react"
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot
} from "firebase/firestore"

import { db } from "../../lib/firebase"
import { useAuth } from "../../context/AuthContext"

import "../../styles/chat.css"

type Message = {
  id?: string
  sender: string
  receiver: string
  message: string
  created_at?: any
}

export default function Chat({ otherUser }: { otherUser: string }) {

  const { user } = useAuth()

  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState("")

  useEffect(() => {

    const q = query(
      collection(db, "messages"),
      orderBy("created_at")
    )

    const unsub = onSnapshot(q, (snap) => {

      const data: Message[] = snap.docs
        .map(doc => ({
          id: doc.id,
          ...(doc.data() as Message)
        }))
        .filter(m =>

          (m.sender === user?.uid &&
            m.receiver === otherUser)

          ||

          (m.sender === otherUser &&
            m.receiver === user?.uid)

        )

      setMessages(data)

    })

    return () => unsub()

  }, [user, otherUser])


  const sendMessage = async () => {

    if (!text.trim()) return

    await addDoc(collection(db, "messages"), {

      sender: user?.uid,
      receiver: otherUser,
      message: text,
      created_at: serverTimestamp()

    })

    setText("")

  }


  return (

    <div className="chat-container">

      <div className="chat-messages">

        {messages.map(m => {

          const mine = m.sender === user?.uid

          return (

            <div
              key={m.id}
              className={mine ? "my-message" : "their-message"}
            >
              {m.message}
            </div>

          )

        })}

      </div>


      <div className="chat-input">

        <input
          placeholder="Type message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button onClick={sendMessage}>
          Send
        </button>

      </div>

    </div>

  )

}
