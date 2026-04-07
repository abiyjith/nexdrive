import { useEffect, useState } from "react";
import { collection, query, where, getDocs, getDoc, doc, addDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import RatingStars from "../../components/RatingStars";
import Toast from "../../components/Toast";
import { motion, AnimatePresence } from "framer-motion";
import { FaCar, FaUserTie, FaMapMarkerAlt, FaCalendarCheck, FaFlag, FaTrashAlt, FaStar, FaCheckCircle, FaClock, FaRupeeSign, FaCommentDots } from "react-icons/fa";
import ChatBox from "../../components/ChatBox";
import "../../styles/customer.css";
import "../../styles/app.css";

export default function Bookings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"vehicles" | "drivers">("vehicles");
  const [driverBookings, setDriverBookings] = useState<any[]>([]);
  const [vehicleBookings, setVehicleBookings] = useState<any[]>([]);
  const [ratings, setRatings] = useState<any>({});
  const [review, setReview] = useState("");
  const [ratedDrivers, setRatedDrivers] = useState<any>({});
  const [ratedVehicles, setRatedVehicles] = useState<any>({});
  const [toast, setToast] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState<{ id: string, name: string } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadDriverBookings(), loadVehicleBookings()]);
      setLoading(false);
    };
    loadData();
  }, []);

  /* ================= DRIVER BOOKINGS ================= */
  const loadDriverBookings = async () => {
    if (!user) return;
    const q = query(collection(db, "driver_bookings"), where("customer_id", "==", user.uid));
    const snap = await getDocs(q);
    const list: any[] = [];
    
    for (const d of snap.docs) {
      const data = d.data();
      const driverSnap = await getDoc(doc(db, "users", data.driver_id));
      const driverName = driverSnap.exists() ? driverSnap.data().first_name : "Driver";
      const driverPhoto = driverSnap.exists() ? driverSnap.data().photoURL : null;
      
      const ratingSnap = await getDocs(
        query(collection(db, "driver_ratings"), where("booking_id", "==", d.id), where("customer_id", "==", user.uid))
      );
      
      if (!ratingSnap.empty) {
        setRatedDrivers((prev: any) => ({ ...prev, [d.id]: true }));
      }
      
      list.push({ id: d.id, ...data, driverName, driverPhoto });
    }
    setDriverBookings(list.sort((a,b) => new Date(b.created_at?.toDate() || 0).getTime() - new Date(a.created_at?.toDate() || 0).getTime()));
  };

  /* ================= VEHICLE BOOKINGS ================= */
  const loadVehicleBookings = async () => {
    if (!user) return;
    const q = query(collection(db, "vehicle_bookings"), where("customer_id", "==", user.uid));
    const snap = await getDocs(q);
    const list: any[] = [];
    
    for (const d of snap.docs) {
      const data = d.data();
      let vehicleName = "Vehicle";
      let vehicleImage = null;
      let ownerName = "Owner";
      
      if (data.vehicle_id) {
        const vSnap = await getDoc(doc(db, "vehicles", data.vehicle_id));
        if (vSnap.exists()) {
          vehicleName = vSnap.data().brand + " " + vSnap.data().model;
          vehicleImage = vSnap.data().vehicle_image;
          if (vSnap.data().owner_id) {
            const oSnap = await getDoc(doc(db, "users", vSnap.data().owner_id));
            if (oSnap.exists()) ownerName = oSnap.data().first_name;
          }
        }
      }
      
      const ratingSnap = await getDocs(
        query(collection(db, "vehicle_ratings"), where("booking_id", "==", d.id), where("customer_id", "==", user.uid))
      );
      
      if (!ratingSnap.empty) {
        setRatedVehicles((prev: any) => ({ ...prev, [d.id]: true }));
      }
      
      list.push({ id: d.id, ...data, vehicleName, vehicleImage, ownerName });
    }
    setVehicleBookings(list.sort((a,b) => new Date(b.created_at?.toDate() || 0).getTime() - new Date(a.created_at?.toDate() || 0).getTime()));
  };

  /* ================= RATE DRIVER ================= */
  const rateDriver = async (driverId: string, bookingId: string) => {
    const rating = ratings[bookingId];
    if (!rating) {
      setToast({ type: "warning", message: "Please select a star rating first" });
      return;
    }
    
    await addDoc(collection(db, "driver_ratings"), {
      driver_id: driverId,
      customer_id: user?.uid,
      booking_id: bookingId,
      rating,
      review,
      created_at: new Date()
    });
    
    setToast({ type: "success", message: "Driver rated successfully!" });
    setRatedDrivers({ ...ratedDrivers, [bookingId]: true });
    setReview("");
  };

  /* ================= RATE VEHICLE ================= */
  const rateVehicle = async (vehicleId: string, bookingId: string) => {
    const rating = ratings[bookingId];
    if (!rating) {
      setToast({ type: "warning", message: "Please select a star rating first" });
      return;
    }
    
    await addDoc(collection(db, "vehicle_ratings"), {
      vehicle_id: vehicleId,
      customer_id: user?.uid,
      booking_id: bookingId,
      rating,
      review,
      created_at: new Date()
    });
    
    setToast({ type: "success", message: "Vehicle rated successfully!" });
    setRatedVehicles({ ...ratedVehicles, [bookingId]: true });
    setReview("");
  };

  /* ================= REPORT DRIVER ================= */
  const reportDriver = async (driverId: string, bookingId: string) => {
    const reason = prompt("Enter report reason:");
    if (!reason || reason.trim() === "") return;
    
    await addDoc(collection(db, "reports"), {
      driver_id: driverId,
      customer_id: user?.uid,
      booking_id: bookingId,
      reason,
      created_at: new Date(),
      status: "pending"
    });
    
    setToast({ type: "success", message: "Report submitted successfully." });
  };

  /* ================= DELETE BOOKING ================= */
  const deleteBooking = async (id: string, type: "driver" | "vehicle") => {
    const confirmDelete = window.confirm("Are you sure you want to permanently delete this booking record?");
    if (!confirmDelete) return;
    
    const collectionName = type === "driver" ? "driver_bookings" : "vehicle_bookings";
    await deleteDoc(doc(db, collectionName, id));
    
    if (type === "driver") loadDriverBookings();
    else loadVehicleBookings();
    
    setToast({ type: "success", message: "Booking record deleted." });
  };

  return (
    <div className="page-container">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '40px' }}
      >
        <h1 className="gradient-text" style={{ fontSize: '36px', marginBottom: '8px' }}>
          My Bookings
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your vehicle rentals and driver hires.</p>
      </motion.div>

      {/* CUSTOM TABS */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
        <button 
          className={`btn-ghost ${activeTab === 'vehicles' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab("vehicles")}
          style={{ 
            color: activeTab === 'vehicles' ? 'var(--text-main)' : 'var(--text-muted)', 
            background: activeTab === 'vehicles' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
            border: activeTab === 'vehicles' ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent'
          }}
        >
          <FaCar /> Vehicle Rentals ({vehicleBookings.length})
        </button>
        <button 
          className={`btn-ghost ${activeTab === 'drivers' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab("drivers")}
          style={{ 
            color: activeTab === 'drivers' ? 'var(--text-main)' : 'var(--text-muted)', 
            background: activeTab === 'drivers' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
            border: activeTab === 'drivers' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent'
          }}
        >
          <FaUserTie /> Driver Hires ({driverBookings.length})
        </button>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center', margin: '60px 0' }}>
            <div className="spinner" style={{ margin: '0 auto', fontSize: '30px', color: 'var(--accent-primary)' }}><FaCalendarCheck /></div>
            <p style={{ color: 'var(--text-muted)', marginTop: '15px' }}>Loading your history...</p>
          </motion.div>
        ) : (
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="cards-grid"
          >
            {/* ================= VEHICLE BOOKINGS ================= */}
            {activeTab === "vehicles" && (
              <>
                {vehicleBookings.length === 0 && (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', background: 'var(--bg-glass)', borderRadius: '16px' }}>
                    <FaCar size={40} style={{ color: 'var(--text-muted)', marginBottom: '15px' }} />
                    <h3 style={{ color: 'var(--text-main)' }}>No vehicle rentals yet</h3>
                    <p style={{ color: 'var(--text-muted)' }}>When you book a vehicle, it will appear here.</p>
                  </div>
                )}
                
                {vehicleBookings.map(b => (
                  <motion.div className="glass-panel" key={b.id} whileHover={{ y: -5 }}>
                    {b.vehicleImage && (
                      <div style={{ height: '140px', margin: '-30px -30px 20px -30px', borderRadius: '16px 16px 0 0', overflow: 'hidden' }}>
                        <img src={b.vehicleImage || 'https://dummyimage.com/400x200/222/fff&text=Unavailable'} onError={(e) => { e.currentTarget.src = 'https://dummyimage.com/400x200/222/fff&text=Unavailable' }} alt={b.vehicleName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                      <h3 style={{ margin: 0, fontSize: '20px' }}>{b.vehicleName}</h3>
                      <span className={`status-badge status-${b.status.toLowerCase()}`}>
                        {b.status === 'completed' ? <FaCheckCircle /> : <FaClock />} {b.status}
                      </span>
                    </div>
                    
                    <div className="details-list" style={{ marginBottom: '20px' }}>
                      <div className="detail-item"><span>Vehicle No</span> <span className="detail-value">{b.vehicle_number}</span></div>
                      <div className="detail-item"><span>Dates</span> <span className="detail-value">{b.start_date} to {b.end_date}</span></div>
                      <div className="detail-item" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '5px' }}>
                        <span>Total Price</span> 
                        <span className="detail-value" style={{ color: 'var(--accent-success)', fontSize: '18px' }}><FaRupeeSign />{b.total_price}</span>
                      </div>
                    </div>
                    
                    <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                      {b.status === "completed" && (
                        <>
                          {!ratedVehicles[b.id] ? (
                            <div style={{ background: 'var(--border-color)', padding: '15px', borderRadius: '12px', marginBottom: '15px' }}>
                              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: 'var(--accent-primary)' }}>Rate this vehicle</h4>
                              <div style={{ marginBottom: '10px' }}>
                                <RatingStars rating={ratings[b.id] || 0} setRating={(val: number) => setRatings({ ...ratings, [b.id]: val })} />
                              </div>
                              <textarea
                                placeholder="Write a short review..."
                                className="input-field"
                                style={{ minHeight: '60px', marginBottom: '10px', fontSize: '13px' }}
                                onChange={(e) => setReview(e.target.value)}
                              />
                              <button className="btn-primary" style={{ width: '100%', padding: '8px' }} onClick={() => rateVehicle(b.vehicle_id, b.id)}>
                                Submit Rating
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-success)', fontSize: '14px', background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '8px', justifyContent: 'center', marginBottom: '15px' }}>
                              <FaStar /> Feedback submitted
                            </div>
                          )}
                        </>
                      )}
                      
                      <button className="btn-ghost" style={{ width: '100%', color: 'var(--accent-primary)' }} onClick={() => setActiveChat({ id: b.id, name: b.ownerName })}>
                        <FaCommentDots /> Chat with Owner
                      </button>
                      
                      {(b.status === "completed" || b.status === "rejected") && (
                        <button className="btn-ghost" style={{ width: '100%', marginTop: '10px', color: 'var(--accent-danger)' }} onClick={() => deleteBooking(b.id, "vehicle")}>
                          <FaTrashAlt /> Delete Record
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </>
            )}

            {/* ================= DRIVER BOOKINGS ================= */}
            {activeTab === "drivers" && (
              <>
                {driverBookings.length === 0 && (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', background: 'var(--bg-glass)', borderRadius: '16px' }}>
                    <FaUserTie size={40} style={{ color: 'var(--text-muted)', marginBottom: '15px' }} />
                    <h3 style={{ color: 'var(--text-main)' }}>No driver hires yet</h3>
                    <p style={{ color: 'var(--text-muted)' }}>When you hire a driver, it will appear here.</p>
                  </div>
                )}
                
                {driverBookings.map(b => (
                  <motion.div className="glass-panel" key={b.id} whileHover={{ y: -5 }}>
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center' }}>
                      <img 
                        src={b.driverPhoto || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                        onError={(e) => { e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png" }}
                        alt={b.driverName} 
                        style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-primary)' }}
                      />
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0, fontSize: '18px' }}>{b.driverName}</h3>
                        <span className={`status-badge status-${b.status.toLowerCase()}`} style={{ marginTop: '5px', display: 'inline-block' }}>
                          {b.status === 'completed' ? <FaCheckCircle /> : <FaClock />} {b.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="details-list" style={{ marginBottom: '20px' }}>
                      <div className="detail-item"><span>Date</span> <span className="detail-value">{b.start_date && b.end_date ? `${b.start_date} to ${b.end_date}` : b.date}</span></div>
                      <div className="detail-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                        <span>Pickup Location</span> 
                        <span className="detail-value" style={{ fontSize: '13px', lineHeight: '1.4', background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '6px', width: '100%' }}>
                          <FaMapMarkerAlt style={{ color: 'var(--accent-primary)' }}/> {b.pickup_location.substring(0,60)}...
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                      <button className="btn-ghost" style={{ flex: 1 }} onClick={() => window.open(`https://www.google.com/maps?q=${b.pickup_location}`)}>
                        <FaMapMarkerAlt /> Map
                      </button>
                      <button className="btn-ghost" style={{ flex: 1, color: 'var(--accent-warning)', border: '1px solid rgba(245, 158, 11, 0.3)' }} onClick={() => reportDriver(b.driver_id, b.id)}>
                        <FaFlag /> Report
                      </button>
                    </div>

                    <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                      {/* DRIVER RATING */}
                      {b.status === "completed" && (
                        <>
                          {!ratedDrivers[b.id] ? (
                            <div style={{ background: 'var(--border-color)', padding: '15px', borderRadius: '12px', marginBottom: '15px' }}>
                              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: 'var(--accent-primary)' }}>Rate this driver</h4>
                              <div style={{ marginBottom: '10px' }}>
                                <RatingStars rating={ratings[b.id] || 0} setRating={(val: number) => setRatings({ ...ratings, [b.id]: val })} />
                              </div>
                              <textarea
                                placeholder="Write a short review..."
                                className="input-field"
                                style={{ minHeight: '60px', marginBottom: '10px', fontSize: '13px' }}
                                onChange={(e) => setReview(e.target.value)}
                              />
                              <button className="btn-primary" style={{ width: '100%', padding: '8px' }} onClick={() => rateDriver(b.driver_id, b.id)}>
                                Submit Rating
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-success)', fontSize: '14px', background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '8px', justifyContent: 'center', marginBottom: '15px' }}>
                              <FaStar /> Feedback submitted
                            </div>
                          )}
                        </>
                      )}
                      
                      <button className="btn-ghost" style={{ width: '100%', color: 'var(--accent-primary)' }} onClick={() => setActiveChat({ id: b.id, name: b.driverName })}>
                        <FaCommentDots /> Chat with Driver
                      </button>

                      {(b.status === "completed" || b.status === "rejected") && (
                        <button className="btn-ghost" style={{ width: '100%', marginTop: '10px', color: 'var(--accent-danger)' }} onClick={() => deleteBooking(b.id, "driver")}>
                          <FaTrashAlt /> Delete Record
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {activeChat && (
        <AnimatePresence>
          <ChatBox chatId={activeChat.id} recipientName={activeChat.name} onClose={() => setActiveChat(null)} />
        </AnimatePresence>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
