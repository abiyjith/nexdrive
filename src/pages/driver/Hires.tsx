import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, updateDoc, getDoc, addDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import Toast from "../../components/Toast";
import { motion, AnimatePresence } from "framer-motion";
import { FaUser, FaCalendarAlt, FaRupeeSign, FaMapMarkerAlt, FaCheckCircle, FaPaperPlane, FaFlag, FaTrash, FaSpinner, FaRegClock, FaCreditCard, FaCommentDots } from "react-icons/fa";
import ChatBox from "../../components/ChatBox";
import "../../styles/app.css";

export default function Hires() {
  const { user } = useAuth();
  const [hires, setHires] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<any>(null);
  const [activeChat, setActiveChat] = useState<{ id: string, name: string } | null>(null);

  useEffect(() => {
    loadHires();
  }, [user]);

  const loadHires = async () => {
    if (!user) return;
    setLoading(true);

    const q = query(
      collection(db, "driver_bookings"),
      where("driver_id", "==", user.uid)
    );

    const snap = await getDocs(q);
    const list: any[] = [];

    for (const d of snap.docs) {
      const data = d.data();
      const customerSnap = await getDoc(doc(db, "users", data.customer_id));
      list.push({
        id: d.id,
        ...data,
        customerName: customerSnap.data()?.first_name || "Unknown Customer"
      });
    }

    setHires(list.sort((a, b) => (b.start_date || b.date)?.localeCompare(a.start_date || a.date)));
    setLoading(false);
  };

  const isTripDatePassed = (tripDate: string, endDate?: string) => {
    const today = new Date();
    const rideDate = new Date(endDate || tripDate);
    today.setHours(0, 0, 0, 0);
    rideDate.setHours(0, 0, 0, 0);
    return today >= rideDate;
  };

  /* ACCEPT HIRE */
  const acceptHire = async (id: string) => {
    await updateDoc(doc(db, "driver_bookings", id), { status: "accepted" });
    setToast({ type: "success", message: "Hire request accepted!" });
    loadHires();
  };

  /* COMPLETE TRIP */
  const completeTrip = async (id: string) => {
    await updateDoc(doc(db, "driver_bookings", id), { status: "completed" });
    setToast({ type: "success", message: "Trip marked as completed!" });
    loadHires();
  };

  /* CONFIRM PAYMENT */
  const confirmPayment = async (h: any) => {
    const method = prompt("Payment method (cash / gpay)");
    if (!method || (method !== "cash" && method !== "gpay")) {
      setToast({ type: "error", message: "Please enter a valid payment method (cash / gpay)." });
      return;
    }

    let txn = "";
    if (method === "gpay") {
      txn = prompt("Enter GPay transaction ID") || "";
    }

    await updateDoc(doc(db, "driver_bookings", h.id), {
      payment_method: method,
      transaction_id: txn,
      payment_status: "paid",
      notify_payment: false
    });

    try {
      const apiUrl = (import.meta as any).env.VITE_API_URL || "http://localhost:5000";
      await fetch(`${apiUrl}/send-driver-invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerEmail: h.customer_email,
          driverName: user?.email,
          date: h.start_date && h.end_date ? `${h.start_date} to ${h.end_date}` : h.date,
          pickupLocation: h.pickup_location,
          price: h.total_price || h.driver_price,
          paymentMethod: method,
          transactionId: txn
        })
      });
    } catch (err) {
      console.log("Invoice send failed (Local server might be down)");
    }

    setToast({ type: "success", message: "Payment confirmed and invoice sent." });
    loadHires();
  };

  /* NOTIFY CUSTOMER */
  const notifyCustomer = async (id: string) => {
    await updateDoc(doc(db, "driver_bookings", id), { notify_payment: true });
    setToast({ type: "info", message: "Customer notified for payment." });
  };

  /* REPORT CUSTOMER */
  const reportCustomer = async (customerId: string, bookingId: string) => {
    const reason = prompt("Enter report reason:");
    if (!reason) return;

    await addDoc(collection(db, "reports"), {
      customer_id: customerId,
      driver_id: user?.uid,
      booking_id: bookingId,
      reason,
      created_at: new Date(),
      status: "pending"
    });
    setToast({ type: "success", message: "Customer reported successfully to admin." });
  };

  /* DELETE BOOKING */
  const deleteHire = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this completed booking history?");
    if (!confirmDelete) return;

    await deleteDoc(doc(db, "driver_bookings", id));
    setToast({ type: "success", message: "Booking removed from history." });
    loadHires();
  };

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
            My Hires
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your incoming ride requests and completed trips.</p>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center', margin: '60px 0' }}>
            <FaSpinner className="spinner" style={{ margin: '0 auto', fontSize: '30px', color: 'var(--accent-primary)' }} />
            <p style={{ color: 'var(--text-muted)', marginTop: '15px' }}>Loading your hire history...</p>
          </motion.div>
        ) : hires.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <FaCalendarAlt size={60} style={{ color: 'var(--text-muted)', marginBottom: '20px' }} />
            <h2 style={{ marginBottom: '10px' }}>No Hires Found</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>When customers hire you for a day, they will appear here.</p>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))' }}
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {hires.map((h) => (
              <motion.div variants={cardVariants} key={h.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>

                {/* Status Badge */}
                <div style={{
                  position: 'absolute', top: '20px', right: '20px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 'bold',
                  color: h.status === "completed" ? 'var(--accent-success)' : h.status === "accepted" ? 'var(--accent-primary)' : 'var(--accent-warning)',
                  background: h.status === "completed" ? 'rgba(16, 185, 129, 0.1)' : h.status === "accepted" ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  padding: '6px 12px', borderRadius: '100px'
                }}>
                  {h.status === "completed" ? <><FaCheckCircle /> Completed</> : h.status === "accepted" ? <><FaCheckCircle /> Accepted</> : <><FaRegClock /> Pending</>}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                  <div style={{ background: 'var(--bg-glass)', padding: '12px', borderRadius: '50%', color: 'var(--accent-primary)' }}>
                    <FaUser size={24} />
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '20px' }}>{h.customerName}</h3>
                    <div style={{ color: 'var(--text-muted)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <FaCalendarAlt /> Date: {h.start_date && h.end_date
                        ? `${new Date(h.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${new Date(h.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                        : new Date(h.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px', marginBottom: '20px', background: 'var(--bg-dark)', padding: '15px', borderRadius: '12px' }}>

                  <div className="detail-item" style={{ marginBottom: 0 }}>
                    <span style={{ fontSize: '11px', display: 'block', marginBottom: '4px' }}><FaRupeeSign /> Total Price {h.days ? `(${h.days} Days)` : ''}</span>
                    <strong style={{ fontSize: '16px', color: 'var(--accent-success)' }}>₹{h.total_price || h.driver_price}</strong>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="detail-item" style={{ marginBottom: 0 }}>
                      <span style={{ fontSize: '11px', display: 'block', marginBottom: '4px' }}><FaCreditCard /> Payment Status</span>
                      <strong style={{ fontSize: '13px', color: h.payment_status === "paid" ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                        {h.payment_status === "paid" ? "Paid" : "Pending"}
                      </strong>
                    </div>
                    {h.payment_method && (
                      <div className="detail-item" style={{ marginBottom: 0 }}>
                        <span style={{ fontSize: '11px', display: 'block', marginBottom: '4px' }}><FaCheckCircle /> Method</span>
                        <strong style={{ fontSize: '13px', textTransform: 'capitalize' }}>{h.payment_method}</strong>
                      </div>
                    )}
                  </div>

                  <div className="detail-item" style={{ marginBottom: 0, paddingRight: '10px' }}>
                    <span style={{ fontSize: '11px', display: 'block', marginBottom: '4px' }}><FaMapMarkerAlt /> Pickup Location</span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{h.pickup_location}</strong>
                      <button
                        className="btn-ghost"
                        style={{ padding: '4px 10px', fontSize: '12px', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)' }}
                        onClick={() => window.open(`https://www.google.com/maps?q=${h.pickup_location}`)}
                      >
                        Open Map
                      </button>
                    </div>
                  </div>

                </div>

                {/* Actions */}
                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>

                  {h.status === "pending" && (
                    <button className="btn-primary" style={{ width: '100%' }} onClick={() => acceptHire(h.id)}>
                      <FaCheckCircle /> Accept Hire Request
                    </button>
                  )}

                  {h.status === "accepted" && isTripDatePassed(h.date, h.end_date) && (
                    <button className="btn-primary" style={{ width: '100%', background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)', color: '#000' }} onClick={() => completeTrip(h.id)}>
                      <FaCheckCircle /> Mark Trip as Completed
                    </button>
                  )}

                  {h.status !== "pending" && h.payment_status !== "paid" && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <button className="btn-primary" style={{ background: 'var(--accent-success)', color: '#000' }} onClick={() => confirmPayment(h)}>
                        <FaRupeeSign /> Confirm Pay
                      </button>
                      <button className="btn-ghost" style={{ border: '1px solid var(--accent-warning)', color: 'var(--accent-warning)' }} onClick={() => notifyCustomer(h.id)}>
                        <FaPaperPlane /> Remind
                      </button>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginTop: '10px' }}>
                    <button
                      className="btn-ghost"
                      style={{ flex: 1, padding: '8px', fontSize: '12px', color: 'var(--accent-danger)' }}
                      onClick={() => reportCustomer(h.customer_id, h.id)}
                    >
                      <FaFlag /> Report Issue
                    </button>

                    {h.status === "completed" && (
                      <button
                        className="btn-ghost"
                        style={{ flex: 1, padding: '8px', fontSize: '12px', color: 'var(--text-muted)' }}
                        onClick={() => deleteHire(h.id)}
                      >
                        <FaTrash /> Remove History
                      </button>
                    )}
                  </div>

                  <button className="btn-ghost" style={{ width: '100%', marginTop: '10px', color: 'var(--accent-primary)' }} onClick={() => setActiveChat({ id: h.id, name: h.customerName })}>
                    <FaCommentDots /> Chat with Customer
                  </button>
                </div>

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
