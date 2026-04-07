import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import Toast from "../../components/Toast";
import { motion, AnimatePresence } from "framer-motion";
import { FaCalendarAlt, FaUser, FaRoute, FaRupeeSign, FaCheckCircle, FaExclamationCircle, FaRegClock, FaWallet, FaPaperPlane, FaCommentDots } from "react-icons/fa";
import ChatBox from "../../components/ChatBox";
import "../../styles/owner.css";
import "../../styles/app.css";

export default function VehicleBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<any>(null);
  const [activeChat, setActiveChat] = useState<{ id: string, name: string } | null>(null);

  useEffect(() => {
    loadBookings();
  }, [user]);

  /* LOAD BOOKINGS */
  const loadBookings = async () => {
    if (!user) return;
    setLoading(true);

    const q = query(collection(db, "vehicle_bookings"), where("owner_id", "==", user.uid));
    const snap = await getDocs(q);

    const list: any[] = [];
    let earnings = 0;

    for (const d of snap.docs) {
      const data = d.data();

      /* CUSTOMER NAME */
      let customerName = "Customer";
      if (data.customer_id) {
        const customerSnap = await getDoc(doc(db, "users", data.customer_id));
        if (customerSnap.exists()) {
          customerName = customerSnap.data().first_name;
        }
      }

      /* VEHICLE INFO */
      let vehicleName = "Vehicle";
      let freeKm = 0;
      let extraPrice = 0;

      if (data.vehicle_id) {
        const vehicleSnap = await getDoc(doc(db, "vehicles", data.vehicle_id));
        if (vehicleSnap.exists()) {
          vehicleName = vehicleSnap.data().brand + " " + vehicleSnap.data().model;
          freeKm = vehicleSnap.data().free_km_per_day || 0;
          extraPrice = vehicleSnap.data().extra_price_per_km || 0;
        }
      }

      /* EARNINGS */
      if (data.payment_status === "paid") {
        earnings += Number(data.total_price || data.price_per_day);
      }

      list.push({
        id: d.id,
        ...data,
        customerName,
        vehicleName,
        freeKm,
        extraPrice
      });
    }

    setBookings(list.sort((a, b) => b.start_date?.localeCompare(a.start_date || "")));
    setTotalEarnings(earnings);
    setLoading(false);
  };

  /* ENTER DISTANCE */
  const enterDistance = async (b: any) => {
    const distance = prompt(`Enter total distance travelled in KM.\n(Free KM: ${b.freeKm}, Extra Charge: ₹${b.extraPrice}/KM)`);
    if (!distance) return;

    const km = Number(distance);
    if (isNaN(km) || km < 0) {
      setToast({ type: "error", message: "Invalid distance entered." });
      return;
    }

    let extraDistance = 0;
    if (km > b.freeKm) {
      extraDistance = km - b.freeKm;
    }

    const extraCharge = extraDistance * b.extraPrice;
    const total = Number(b.price_per_day) + extraCharge;

    await updateDoc(doc(db, "vehicle_bookings", b.id), {
      distance_travelled: km,
      extra_distance: extraDistance,
      total_price: total
    });

    setToast({ type: "success", message: `Distance saved. Total price updated to ₹${total}.` });
    loadBookings();
  };

  /* CONFIRM PAYMENT */
  const confirmPayment = async (b: any) => {
    const method = prompt("Payment method (cash / gpay)");
    if (!method || (method !== "cash" && method !== "gpay")) {
      setToast({ type: "error", message: "Please enter a valid payment method (cash / gpay)." });
      return;
    }

    let txn = "";
    if (method === "gpay") {
      txn = prompt("Enter GPay transaction ID") || "";
    }

    await updateDoc(doc(db, "vehicle_bookings", b.id), {
      payment_method: method,
      transaction_id: txn,
      payment_status: "paid"
    });

    /* SEND EMAIL RECEIPT */
    try {
      const apiUrl = (import.meta as any).env.VITE_API_URL || "http://localhost:5000";
      await fetch(`${apiUrl}/send-receipt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerEmail: b.customer_email,
          vehicleName: b.vehicleName,
          vehicleNumber: b.vehicle_number,
          distance: b.distance_travelled,
          freeKm: b.freeKm,
          extraDistance: b.extra_distance,
          extraCharge: (b.extra_distance || 0) * (b.extraPrice || 0),
          pricePerDay: b.price_per_day,
          totalPrice: b.total_price,
          paymentMethod: method,
          transactionId: txn
        })
      });
    } catch (err) {
      console.log("Email failed (Local server might be down)");
    }

    setToast({ type: "success", message: "Payment confirmed and receipt generated." });
    loadBookings();
  };

  /* NOTIFY CUSTOMER */
  const notifyCustomer = async (id: string) => {
    await updateDoc(doc(db, "vehicle_bookings", id), {
      notify_payment: true
    });
    setToast({ type: "info", message: "Customer notified about pending payment." });
    loadBookings();
  };

  /* COMPLETE BOOKING */
  const completeBooking = async (id: string, vehicleId: string, date: string) => {
    const today = new Date().toISOString().split("T")[0];
    if (today < date) {
      setToast({ type: "warning", message: "Cannot complete booking before the ride date." });
      return;
    }

    await updateDoc(doc(db, "vehicle_bookings", id), { status: "completed" });
    await updateDoc(doc(db, "vehicles", vehicleId), { is_available: true });

    setToast({ type: "success", message: "Booking completed and vehicle made available again." });
    loadBookings();
  };

  const activeBookings = bookings.filter(b => b.status !== "completed");
  const completedBookings = bookings.filter(b => b.status === "completed");
  const displayedBookings = activeTab === "active" ? activeBookings : completedBookings;

  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const cardVariants: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}
      >
        <div>
          <h1 className="gradient-text" style={{ fontSize: '36px', marginBottom: '8px' }}>
            Bookings Received
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage customer requests, track distance, and handle payments.</p>
        </div>

        <div className="glass-panel" style={{ padding: '15px 25px', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--accent-success)' }}>
            <FaWallet size={24} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Earnings</p>
            <h2 style={{ margin: 0, fontSize: '28px', color: 'var(--accent-success)' }}>₹{totalEarnings.toLocaleString()}</h2>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
        <button
          className={activeTab === "active" ? "btn-primary" : "btn-ghost"}
          onClick={() => setActiveTab("active")}
          style={{ padding: '10px 20px', borderRadius: '100px' }}
        >
          Active Trips ({activeBookings.length})
        </button>
        <button
          className={activeTab === "completed" ? "btn-primary" : "btn-ghost"}
          onClick={() => setActiveTab("completed")}
          style={{ padding: '10px 20px', borderRadius: '100px' }}
        >
          History ({completedBookings.length})
        </button>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center', margin: '60px 0' }}>
            <div className="spinner" style={{ margin: '0 auto', fontSize: '30px', color: 'var(--accent-primary)' }}><FaCalendarAlt /></div>
            <p style={{ color: 'var(--text-muted)', marginTop: '15px' }}>Loading booking data...</p>
          </motion.div>
        ) : displayedBookings.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <FaCalendarAlt size={60} style={{ color: 'var(--text-muted)', marginBottom: '20px' }} />
            <h2 style={{ marginBottom: '10px' }}>No {activeTab} bookings found</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>When customers book your vehicles, they will appear here.</p>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))' }}
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {displayedBookings.map((b) => (
              <motion.div variants={cardVariants} key={b.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>

                {/* Status Badge */}
                <div style={{
                  position: 'absolute', top: '20px', right: '20px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 'bold',
                  color: b.status === "completed" ? 'var(--accent-success)' : 'var(--accent-warning)',
                  background: b.status === "completed" ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  padding: '6px 12px', borderRadius: '100px'
                }}>
                  {b.status === "completed" ? <><FaCheckCircle /> Completed</> : <><FaRegClock /> Active Trip</>}
                </div>

                <h3 style={{ margin: '0 0 5px 0', fontSize: '20px', paddingRight: '100px' }}>{b.vehicleName}</h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
                  <FaUser /> {b.customerName}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px', background: 'var(--bg-dark)', padding: '15px', borderRadius: '12px' }}>
                  <div className="detail-item" style={{ marginBottom: 0 }}>
                    <span style={{ fontSize: '11px', display: 'block', marginBottom: '4px' }}><FaCalendarAlt /> Dates</span>
                    <strong style={{ fontSize: '13px' }}>{b.start_date ? `${b.start_date} to ${b.end_date}` : b.date}</strong>
                  </div>
                  <div className="detail-item" style={{ marginBottom: 0 }}>
                    <span style={{ fontSize: '11px', display: 'block', marginBottom: '4px' }}><FaRupeeSign /> Payment Status</span>
                    <strong style={{ fontSize: '13px', color: b.payment_status === "paid" ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                      {b.payment_status === "paid" ? "Paid" : "Pending"}
                    </strong>
                  </div>
                  {b.distance_travelled && (
                    <div className="detail-item" style={{ marginBottom: 0 }}>
                      <span style={{ fontSize: '11px', display: 'block', marginBottom: '4px' }}><FaRoute /> Distance</span>
                      <strong style={{ fontSize: '13px' }}>{b.distance_travelled} KM</strong>
                    </div>
                  )}
                  {b.total_price && (
                    <div className="detail-item" style={{ marginBottom: 0 }}>
                      <span style={{ fontSize: '11px', display: 'block', marginBottom: '4px' }}><FaWallet /> Total Billed</span>
                      <strong style={{ fontSize: '14px', color: 'var(--accent-primary)' }}>₹{b.total_price}</strong>
                    </div>
                  )}
                </div>

                {/* Actions (Only for Active tab) */}
                {b.status !== "completed" && (
                  <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>

                    {!b.distance_travelled && (
                      <button className="btn-primary" style={{ width: '100%' }} onClick={() => enterDistance(b)}>
                        <FaRoute /> Enter Final Distance
                      </button>
                    )}

                    {b.distance_travelled && b.payment_status !== "paid" && (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn-primary" style={{ flex: 1, background: 'var(--accent-success)', color: '#000' }} onClick={() => confirmPayment(b)}>
                          <FaCheckCircle /> Confirm Pay
                        </button>
                        <button className="btn-ghost" style={{ flex: 1, border: '1px solid var(--accent-warning)', color: 'var(--accent-warning)' }} onClick={() => notifyCustomer(b.id)}>
                          <FaPaperPlane /> Notify
                        </button>
                      </div>
                    )}

                    {b.payment_status === "paid" && b.status !== "completed" && (
                      <button className="btn-primary" style={{ width: '100%', background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)' }} onClick={() => completeBooking(b.id, b.vehicle_id, b.start_date || b.date)}>
                        <FaCheckCircle /> Finalize & Complete Booking
                      </button>
                    )}
                  </div>
                )}

                <button
                  className="btn-ghost"
                  style={{
                    width: '100%',
                    marginTop: b.status === "completed" ? 'auto' : '15px',
                    borderTop: b.status === "completed" ? '1px solid var(--border-color)' : 'none',
                    paddingTop: b.status === "completed" ? '15px' : '10px',
                    color: 'var(--accent-primary)'
                  }}
                  onClick={() => setActiveChat({ id: b.id, name: b.customerName })}
                >
                  <FaCommentDots /> Chat with Customer
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {activeChat && (
        <AnimatePresence>
          <ChatBox chatId={activeChat.id} recipientName={activeChat.name} onClose={() => setActiveChat(null)} />
        </AnimatePresence>
      )}

      {/* TOAST NOTIFICATION */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
