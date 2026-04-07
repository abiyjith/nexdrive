import { useEffect, useState } from "react";
import { collection, getDocs, query, where, addDoc, getDoc, doc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import MapPicker from "../../components/MapPicker";
import Toast from "../../components/Toast";
import { motion } from "framer-motion";
import { FaCalendarAlt, FaStar, FaUserTie, FaMapMarkerAlt, FaEnvelope } from "react-icons/fa";
import "../../styles/customer.css";
import "../../styles/app.css";
import { useLocation } from "react-router-dom";

export default function Drivers() {
  const { user } = useAuth();
  const locationState = useLocation();

  const [drivers, setDrivers] = useState<any[]>([]);
  const [startDate, setStartDate] = useState(locationState.state?.startDate || "");
  const [endDate, setEndDate] = useState(locationState.state?.endDate || "");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<any>(null);

  useEffect(() => {
    if (startDate && endDate) loadDrivers();
  }, [startDate, endDate]);

  const loadDrivers = async () => {
    if (!startDate || !endDate || startDate > endDate) return;
    setLoading(true);

    try {
      const requestedDates: string[] = [];
      let current = new Date(startDate);
      current.setHours(0,0,0,0);
      const endMidnight = new Date(endDate);
      endMidnight.setHours(0,0,0,0);
      
      while (current <= endMidnight) {
        requestedDates.push(current.toISOString().split("T")[0]);
        current.setDate(current.getDate() + 1);
      }

      const availSnap = await getDocs(query(
        collection(db, "driver_availability"), 
        where("date", ">=", startDate),
        where("date", "<=", endDate)
      ));
      
      const availCounts: any = {};
      availSnap.docs.forEach(d => {
        const data = d.data();
        availCounts[data.driver_id] = (availCounts[data.driver_id] || 0) + 1;
      });

      const availableDriverIds = Object.keys(availCounts).filter(id => availCounts[id] === requestedDates.length);

      const bookingSnap = await getDocs(collection(db, "driver_bookings"));
      const bookedDriverIds = bookingSnap.docs.filter(d => {
         const data = d.data();
         if (data.start_date && data.end_date) {
            return (data.start_date <= endDate && data.end_date >= startDate);
         }
         if (data.date) {
            return (data.date >= startDate && data.date <= endDate);
         }
         return false;
      }).map(d => d.data().driver_id);

      const finalDrivers = availableDriverIds.filter(id => !bookedDriverIds.includes(id));

      const list: any = [];

      for (const id of finalDrivers) {
        const userSnap = await getDoc(doc(db, "users", id));
        if (userSnap.exists()) {
          const ratingSnap = await getDocs(query(collection(db, "driver_ratings"), where("driver_id", "==", id)));
          let total = 0;
          ratingSnap.docs.forEach(d => { total += d.data().rating; });
          const rating = ratingSnap.size ? (total / ratingSnap.size).toFixed(1) : 0;
          const reviews = ratingSnap.docs.map(d => d.data());

          const days = requestedDates.length;
          const driverPrice = userSnap.data().driver_price_per_day || 0;
          const totalPrice = driverPrice * days;

          list.push({ id, rating, reviews, ...userSnap.data(), days, totalPrice });
        }
      }
      setDrivers(list);
    } catch (error) {
      setToast({ type: "error", message: "Failed to load drivers" });
    }
    setLoading(false);
  };

  const hireDriver = async (driver: any) => {
    if (!startDate || !endDate) {
      setToast({ type: "warning", message: "Please select a date range first" });
      return;
    }

    if (!location) {
      setToast({ type: "warning", message: "Please select a pickup location on the map" });
      return;
    }

    try {
      await addDoc(collection(db, "driver_bookings"), {
        driver_id: driver.id,
        customer_id: user?.uid,
        customer_email: user?.email,
        start_date: startDate,
        end_date: endDate,
        days: driver.days,
        pickup_location: location,
        driver_price: driver.driver_price_per_day || 0,
        total_price: driver.totalPrice || 0,
        payment_method: "",
        transaction_id: "",
        payment_status: "pending",
        notify_payment: false,
        status: "pending",
        created_at: new Date()
      });

      setToast({ type: "success", message: `Hired ${driver.first_name} successfully!` });
      loadDrivers();
    } catch (error) {
      setToast({ type: "error", message: "Booking failed. Try again." });
    }
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
        style={{ marginBottom: '40px', textAlign: 'center' }}
      >
        <h1 className="gradient-text" style={{ fontSize: '36px', marginBottom: '8px' }}>
          Hire Professional Drivers
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Find experienced drivers ready to take you safely to your destination.</p>
      </motion.div>

      <motion.div 
        className="glass-panel" 
        style={{ padding: '30px', marginBottom: '40px' }}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', alignItems: 'center' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="input-group">
              <label><FaCalendarAlt /> Select Booking Target Dates</label>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>From</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>To</label>
                  <input
                    type="date"
                    min={startDate || new Date().toISOString().split("T")[0]}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

            </div>
            
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <h4 style={{ color: 'var(--accent-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaMapMarkerAlt /> Pickup Location
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '15px' }}>
                Tap on the map to pinpoint exactly where the driver should meet you.
              </p>
              {location && (
                <div style={{ padding: '8px 12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '6px', fontSize: '12px', wordBreak: 'break-all' }}>
                  Location Selected: {location.substring(0, 30)}...
                </div>
              )}
            </div>
          </div>

          <div style={{ height: '300px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative' }}>
            <MapPicker setLocation={setLocation} />
            <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', padding: '6px 12px', borderRadius: '100px', fontSize: '12px', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)' }}>
              Interactive Map
            </div>
          </div>

        </div>
      </motion.div>

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '60px', color: 'var(--text-muted)' }}>
          <FaUserTie size={40} className="spinner" style={{ marginBottom: '15px' }} />
          <h3>Finding available drivers for your dates...</h3>
        </div>
      ) : startDate && endDate && drivers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'var(--bg-card)', borderRadius: '16px', color: 'var(--text-muted)' }}>
          <h3>No drivers available</h3>
          <p>There are currently no drivers free for all the dates in your selected range. Try different dates.</p>
        </div>
      ) : (
        <motion.div 
          className="drivers-grid"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {drivers.map(driver => (
            <motion.div key={driver.id} variants={cardVariants} className="driver-card" >
              {driver.rating >= 4.5 && <span className="ai-badge">Top Driver</span>}

              <img
                src={driver.photoURL || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                onError={(e) => { e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png" }}
                className="driver-avatar"
                alt={driver.first_name}
              />
              
              <h3 className="driver-name" style={{ textAlign: 'center' }}>{driver.first_name} {driver.last_name}</h3>
              
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', background: 'rgba(250, 204, 21, 0.1)', color: '#facc15', padding: '4px 12px', borderRadius: '100px', fontSize: '14px', fontWeight: 'bold', width: 'fit-content', margin: '0 auto 20px auto' }}>
                <FaStar /> {driver.rating || "New"}
              </div>

              <div className="details-list">
                <div className="detail-item" style={{ justifyContent: 'center', gap: '8px' }}>
                  <FaEnvelope style={{ color: 'var(--accent-primary)' }}/> 
                  <span>{driver.email}</span>
                </div>
                <div className="detail-item" style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '12px' }}>Total Fee ({driver.days} Days)</span> 
                  <span className="detail-value" style={{ fontSize: '20px', color: 'var(--accent-success)' }}>
                    ₹{driver.totalPrice} <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text-muted)' }}>/ total</span>
                  </span>
                </div>
              </div>

              {/* REVIEWS */}
              {driver.reviews?.slice(0, 1).map((r: any, i: number) => (
                <div key={i} className="review-box" style={{ fontSize: '12px', fontStyle: 'italic', marginBottom: '20px' }}>
                  "{r.review.substring(0, 60)}{r.review.length > 60 ? '...' : ''}"
                </div>
              ))}

              <button
                className="btn-primary"
                style={{ width: '100%', marginTop: 'auto' }}
                onClick={() => hireDriver(driver)}
              >
                <FaUserTie /> Hire Driver
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* TOAST */}
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
