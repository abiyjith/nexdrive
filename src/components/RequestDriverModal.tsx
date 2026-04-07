import { useState } from "react"
import { db } from "../lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { useAuth } from "../context/AuthContext"

export default function RequestDriverModal({ driver }: any) {

  const { user } = useAuth()

  const [location, setLocation] = useState("")
  const [payment, setPayment] = useState("cash")

  const book = async () => {

    await addDoc(collection(db, "driver_bookings"), {
      customer_id: user?.uid,
      driver_id: driver.id,
      location,
      payment_method: payment,
      status: "pending",
      created_at: serverTimestamp()
    })

    alert("Driver booked!")

  }

  return (

    <div className="modal">

      <h3>Book Driver</h3>

      <input
        placeholder="Pickup Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />

      <select
        value={payment}
        onChange={(e) => setPayment(e.target.value)}
      >

        <option value="cash">Cash</option>
        <option value="online">Online</option>

      </select>

      <button onClick={book} className="primary-btn">
        Submit
      </button>

    </div>

  )

}
