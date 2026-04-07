import { useEffect, useState } from "react";
import { collection, query, where, getDocs, updateDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import Toast from "../../components/Toast";
import { motion, AnimatePresence } from "framer-motion";
import { FaCar, FaMapMarkerAlt, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaExclamationCircle, FaEye, FaEyeSlash, FaKey, FaEdit } from "react-icons/fa";
import EditVehicleModal from "../../components/EditVehicleModal";
import ImageCarousel from "../../components/ImageCarousel";
import "../../styles/owner.css";
import "../../styles/app.css";

export default function YourVehicles() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [toast, setToast] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingVehicle, setEditingVehicle] = useState<any | null>(null);

  /* ================================
     LOAD VEHICLES + NOTIFICATIONS
  ================================ */
  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadVehicles(), loadNotifications()]);
      setLoading(false);
    };
    loadData();
  }, [user]);

  /* ================================
     LOAD VEHICLES
  ================================ */
  const loadVehicles = async () => {
    if (!user) return;
    const q = query(collection(db, "vehicles"), where("owner_id", "==", user.uid));
    const snap = await getDocs(q);
    const list: any[] = [];

    for (const d of snap.docs) {
      const data = d.data();
      /* BOOKING INFO */
      let bookingInfo = null;
      const bookingQuery = query(
        collection(db, "vehicle_bookings"),
        where("vehicle_id", "==", d.id),
        where("status", "!=", "completed")
      );
      
      const bookingSnap = await getDocs(bookingQuery);
      
      if (!bookingSnap.empty) {
        const bookingData = bookingSnap.docs[0].data();
        let customerName = "Customer";
        
        if (bookingData.customer_id) {
          const customerSnap = await getDoc(doc(db, "users", bookingData.customer_id));
          if (customerSnap.exists()) {
            customerName = customerSnap.data().first_name;
          }
        }
        
        bookingInfo = {
          customer_name: customerName,
          start_date: bookingData.start_date,
          end_date: bookingData.end_date,
          total_price: bookingData.total_price,
          payment_status: bookingData.payment_status
        };
      }
      
      list.push({ id: d.id, ...data, bookingInfo });
    }
    
    // Sort logic (optional, but good for UX) - e.g., pending first
    list.sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return 0;
    });

    setVehicles(list);
  };

  /* ================================
     LOAD ADMIN MESSAGE
  ================================ */
  const loadNotifications = async () => {
    if (!user) return;
    const q = query(collection(db, "notifications"), where("user_id", "==", user.uid), where("read", "==", false));
    const snap = await getDocs(q);
    const notifications = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
    
    if (notifications.length) {
      setToast({ id: notifications[0].id, type: "warning", message: notifications[0].message });
    }
  };

  const closeToast = async () => {
    if (!toast) return;
    if (toast.id) {
      await updateDoc(doc(db, "notifications", toast.id), { read: true });
    }
    setToast(null);
  };

  /* ================================
     REACTIVATE VEHICLE
  ================================ */
  const reactivateVehicle = async (id: string, brand: string) => {
    await updateDoc(doc(db, "vehicles", id), { is_available: true });
    setToast({ type: "success", message: `${brand} is now visible to customers.` });
    loadVehicles();
  };

  /* ================================
     DEACTIVATE VEHICLE
  ================================ */
  const deactivateVehicle = async (id: string, brand: string) => {
    await updateDoc(doc(db, "vehicles", id), { is_available: false });
    setToast({ type: "info", message: `${brand} hidden from search.` });
    loadVehicles();
  };

  /* ================================
     OPEN GOOGLE MAP
  ================================ */
  const openMap = (location: string) => {
    window.open(`https://www.google.com/maps?q=${location}`);
  };

  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const cardVariants: any = {
    hidden: { opacity: 0, scale: 0.95, y: 30 },
    show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <div className="page-container">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}
      >
        <div>
          <h1 className="gradient-text" style={{ fontSize: '36px', marginBottom: '8px' }}>
            Your Fleet
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage statuses, view bookings, and update visibility.</p>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center', margin: '60px 0' }}>
            <div className="spinner" style={{ margin: '0 auto', fontSize: '30px', color: 'var(--accent-primary)' }}><FaCar /></div>
            <p style={{ color: 'var(--text-muted)', marginTop: '15px' }}>Loading fleet data...</p>
          </motion.div>
        ) : vehicles.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <FaCar size={60} style={{ color: 'var(--text-muted)', marginBottom: '20px' }} />
            <h2 style={{ marginBottom: '10px' }}>No vehicles registered</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Add a vehicle to start earning with NexDrive.</p>
          </motion.div>
        ) : (
          <motion.div 
            key="grid"
            className="cards-grid"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {vehicles.map(v => (
              <motion.div variants={cardVariants}  key={v.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                
                {/* Admin Status Banner */}
                {v.status === "pending" && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: 'rgba(245, 158, 11, 0.9)', color: '#fff', fontSize: '12px', fontWeight: 'bold', textAlign: 'center', padding: '6px', zIndex: 10 }}><FaExclamationCircle /> Pending Admin Approval</div>}
                {v.status === "rejected" && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: 'rgba(239, 68, 68, 0.9)', color: '#fff', fontSize: '12px', fontWeight: 'bold', textAlign: 'center', padding: '6px', zIndex: 10 }}><FaTimesCircle /> Rejected by Admin</div>}

                {/* Cover Image */}
                <div style={{ height: '180px', margin: '-30px -30px 20px -30px', position: 'relative', background: 'var(--bg-dark)', opacity: v.status === "rejected" ? 0.5 : 1 }}>
                  {v.vehicle_image || (v.images && v.images.length > 0) ? (
                    <ImageCarousel 
                      images={v.images || (v.vehicle_image ? [v.vehicle_image] : [])} 
                      altText={`${v.brand} ${v.model}`} 
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}><FaCar size={40} /></div>
                  )}
                  
                  {/* Active Booking Badge Overlay */}
                  {v.bookingInfo && (
                    <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(59, 130, 246, 0.9)', color: '#fff', padding: '6px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                      <FaKey /> Currently Rented
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px', marginTop: v.status !== "approved" ? '15px' : '0' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '22px' }}>{v.brand} {v.model}</h3>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{v.year} • {v.fuel}</div>
                  </div>
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', padding: '6px 12px', borderRadius: '8px', fontWeight: 'bold' }}>
                    ₹{v.price_per_day}<span style={{ fontSize: '12px', fontWeight: 'normal' }}>/day</span>
                  </div>
                </div>

                {v.location && (
                  <button className="btn-ghost" style={{ padding: '8px', fontSize: '13px', marginBottom: '10px', width: '100%', justifyContent: 'flex-start' }} onClick={() => openMap(v.location)}>
                    <FaMapMarkerAlt style={{ color: 'var(--accent-primary)' }}/> View Location Details
                  </button>
                )}

                <button className="btn-ghost" style={{ padding: '8px', fontSize: '13px', marginBottom: '20px', width: '100%', justifyContent: 'flex-start', border: '1px solid var(--border-color)' }} onClick={() => setEditingVehicle(v)}>
                  <FaEdit style={{ color: 'var(--text-muted)' }}/> Edit Vehicle Details & Images
                </button>

                {/* REJECTION MESSAGE */}
                {v.status === "rejected" && v.admin_message && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
                    <h4 style={{ color: 'var(--accent-danger)', margin: '0 0 5px 0', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}><FaTimesCircle /> Rejection Reason</h4>
                    <p style={{ fontSize: '13px', margin: 0 }}>{v.admin_message}</p>
                  </div>
                )}

                {/* BOOKING INFO */}
                {v.bookingInfo && (
                  <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
                    <h4 style={{ color: 'var(--accent-primary)', margin: '0 0 10px 0', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}><FaCalendarAlt /> Active Rental</h4>
                    <div className="detail-item" style={{ marginBottom: '8px', padding: 0 }}><span>Customer:</span> <span className="detail-value">{v.bookingInfo.customer_name}</span></div>
                    <div className="detail-item" style={{ marginBottom: '8px', padding: 0 }}><span>Period:</span> <span className="detail-value">{v.bookingInfo.start_date} to {v.bookingInfo.end_date}</span></div>
                    <div className="detail-item" style={{ marginBottom: 0, padding: 0 }}>
                      <span>Payment:</span> 
                      <span className="detail-value" style={{ color: v.bookingInfo.payment_status === "paid" ? 'var(--accent-success)' : 'var(--accent-warning)' }}>
                        {v.bookingInfo.payment_status === "paid" ? "Paid" : "Pending"}
                      </span>
                    </div>
                  </div>
                )}

                {/* VISIBILITY CONTROLS */}
                <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                  {v.status === "approved" ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: v.is_available ? 'var(--accent-success)' : 'var(--text-muted)' }}>
                        {v.is_available ? <><FaCheckCircle /> Visible to clients</> : <><FaEyeSlash /> Hidden from search</>}
                      </div>
                      
                      {v.is_available ? (
                        <button className="btn-ghost" style={{ padding: '8px 16px', color: 'var(--accent-warning)', border: '1px solid rgba(245, 158, 11, 0.3)' }} onClick={() => deactivateVehicle(v.id, v.brand)}>
                          Hide Vehicle
                        </button>
                      ) : (
                        <button className="btn-primary" style={{ padding: '8px 16px' }} onClick={() => reactivateVehicle(v.id, v.brand)}>
                          <FaEye /> Activate Show
                        </button>
                      )}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
                      Admin approval required to edit visibility
                    </div>
                  )}
                </div>

              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* EDIT MODAL */}
      {editingVehicle && (
        <EditVehicleModal 
          vehicle={editingVehicle} 
          onClose={() => setEditingVehicle(null)} 
          onUpdate={loadVehicles} 
        />
      )}

      {/* TOAST NOTIFICATION */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
    </div>
  );
}
