import { useEffect, useState } from "react";
import { collection, addDoc, doc, getDoc, onSnapshot, query, where, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import { DateRange } from "react-date-range";
import { useNavigate } from "react-router-dom";
import { addDays } from "date-fns";
import Toast from "../../components/Toast";
import ImageCarousel from "../../components/ImageCarousel";
import { motion } from "framer-motion";
import { FaMapMarkerAlt, FaStar, FaCar, FaCalendarAlt, FaGasPump } from "react-icons/fa";
import "../../styles/customer.css";
import "../../styles/app.css";

export default function Vehicles() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<any>(null);
  const [toast, setToast] = useState<any>(null);
  const [activeCalendar, setActiveCalendar] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [driverPromptData, setDriverPromptData] = useState<any>(null);

  const [selectionRange, setSelectionRange] = useState({
    startDate: new Date(),
    endDate: addDays(new Date(), 1),
    key: "selection"
  });

  const [disabledDates, setDisabledDates] = useState<Date[]>([]);
  const [bookingLoading, setBookingLoading] = useState(false);

  // ================= LOCATION =================
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(pos => {
      const location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setUserLocation(location);
      loadVehicles(location);
    }, () => {
      // Fallback if location denied
      loadVehicles(null);
    });
  }, []);

  // ================= REALTIME BOOKINGS =================
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "vehicle_bookings"), snap => {
      const list: any[] = [];
      snap.forEach(doc => list.push(doc.data()));
      setBookings(list);
    });
    return () => unsub();
  }, []);

  // ================= DISTANCE =================
  const calculateDistance = (lat1: any, lng1: any, lat2: any, lng2: any) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // ================= LOAD VEHICLES =================
  const loadVehicles = async (location: any) => {
    const snap = await getDocs(collection(db, "vehicles"));
    const list: any = [];

    for (const v of snap.docs) {
      const data = v.data();
      if (data.status !== "approved") continue;
      if (data.is_available === false) continue;

      let ownerName = "Owner";
      if (data.owner_id) {
        const ownerSnap = await getDoc(doc(db, "users", data.owner_id));
        if (ownerSnap.exists()) {
          ownerName = ownerSnap.data().first_name;
        }
      }

      let distance = 999;
      if (location && data.location) {
        const [lat, lng] = data.location.split(",");
        distance = calculateDistance(location.lat, location.lng, parseFloat(lat), parseFloat(lng));
      }

      /* VEHICLE RATING */
      const ratingSnap = await getDocs(query(collection(db, "vehicle_ratings"), where("vehicle_id", "==", v.id)));
      let totalRating = 0;
      ratingSnap.docs.forEach(d => { totalRating += d.data().rating; });
      const rating = ratingSnap.size ? (totalRating / ratingSnap.size).toFixed(1) : 0;
      const reviews = ratingSnap.docs.map(d => d.data());

      list.push({ id: v.id, rating, reviews, ...data, ownerName, distance });
    }

    list.sort((a: any, b: any) => a.distance - b.distance);
    setVehicles(list);
    setLoading(false);
  };

  // ================= LOAD BOOKED DATES =================
  const loadBookedDates = async (vehicleId: string) => {
    const q = query(collection(db, "vehicle_bookings"), where("vehicle_id", "==", vehicleId));
    const snap = await getDocs(q);
    const dates: Date[] = [];

    snap.forEach(d => {
      const data = d.data();
      let current = new Date(data.start_date);
      const end = new Date(data.end_date);
      while (current <= end) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
    });
    setDisabledDates(dates);
  };

  // ================= BOOK VEHICLE =================
  const bookVehicle = async () => {
    if (!selectedVehicle || !user) return;
    setBookingLoading(true);

    const start = selectionRange.startDate.toISOString().split("T")[0];
    const end = selectionRange.endDate.toISOString().split("T")[0];
    const startDate = new Date(start);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      setToast({ type: "warning", message: "Cannot book past dates" });
      setBookingLoading(false);
      return;
    }

    const q = query(collection(db, "vehicle_bookings"), where("vehicle_id", "==", selectedVehicle.id));
    const snap = await getDocs(q);

    for (const d of snap.docs) {
      const data = d.data();
      if (start <= data.end_date && end >= data.start_date) {
        setToast({ type: "warning", message: "Vehicle already booked for selected dates" });
        setBookingLoading(false);
        return;
      }
    }

    const endDate = new Date(end);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const totalPrice = selectedVehicle.price_per_day * days;

    await addDoc(collection(db, "vehicle_bookings"), {
      vehicle_id: selectedVehicle.id,
      vehicle_name: selectedVehicle.brand + " " + selectedVehicle.model,
      vehicle_number: selectedVehicle.vehicle_number,
      owner_id: selectedVehicle.owner_id,
      customer_id: user.uid,
      customer_email: user.email,
      price_per_day: selectedVehicle.price_per_day,
      start_date: start,
      end_date: end,
      days,
      total_price: totalPrice,
      status: "pending",
      payment_status: "pending",
      created_at: new Date()
    });

    setToast({ type: "success", message: `Vehicle booked for ${days} days` });
    setDriverPromptData({ startDate: start, endDate: end });
    setActiveCalendar(null);
    setSelectedVehicle(null);
    setBookingLoading(false);
  };

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
        style={{ marginBottom: '30px', textAlign: 'center' }}
      >
        <h1 className="gradient-text" style={{ fontSize: '36px', marginBottom: '8px' }}>
          Explore Vehicles
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Find the perfect ride, recommended by AI based on your location.</p>
      </motion.div>

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '100px', color: 'var(--text-muted)' }}>
          <FaCar size={40} className="spinner" style={{ marginBottom: '15px' }} />
          <h3>Loading available vehicles...</h3>
        </div>
      ) : (
        <motion.div 
          className="cards-grid"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {vehicles.map(v => (
            <motion.div key={v.id} variants={cardVariants} className="vehicle-card" >
              {v.rating >= 4.5 && <span className="ai-badge">Top Rated</span>}
              {v.distance < 5 && <span className="ai-badge" style={{ right: v.rating >= 4.5 ? '110px' : '16px', background: 'var(--accent-primary)' }}>Nearby</span>}
              
              <div className="vehicle-image" style={{ borderRadius: '16px 16px 0 0', overflow: 'hidden', padding: 0 }}>
                <ImageCarousel 
                  images={v.images || (v.vehicle_image ? [v.vehicle_image] : [])} 
                  altText={`${v.brand} ${v.model}`} 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 className="vehicle-name">{v.brand} {v.model}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(250, 204, 21, 0.1)', color: '#facc15', padding: '4px 8px', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold' }}>
                  <FaStar /> {v.rating || "New"}
                </div>
              </div>

              <div className="details-list">
                <div className="detail-item"><span>Owner</span> <span className="detail-value">{v.ownerName}</span></div>
                <div className="detail-item"><span>Distance</span> <span className="detail-value">{v.distance === 999 ? 'Unknown' : `${v.distance.toFixed(1)} km`}</span></div>
                <div className="detail-item"><span>Fuel & Year</span> <span className="detail-value">{v.fuel} • {v.year}</span></div>
                <div className="detail-item" style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                  <span>Price per day</span> 
                  <span className="detail-value" style={{ fontSize: '18px', color: 'var(--accent-success)' }}>₹{v.price_per_day}</span>
                </div>
              </div>

              <div className="vehicle-actions">
                <button 
                  className="btn-primary" 
                  onClick={() => {
                    loadBookedDates(v.id);
                    setSelectedVehicle(v);
                    setActiveCalendar(v.id);
                  }}
                >
                  <FaCalendarAlt /> Book
                </button>
                <button className="btn-ghost" onClick={() => openMap(v.location)}>
                  <FaMapMarkerAlt /> Map
                </button>
              </div>
            </motion.div>
          ))}
          {vehicles.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', background: 'var(--bg-card)', borderRadius: '16px', color: 'var(--text-muted)' }}>
              <h3>No vehicles found</h3>
              <p>There are currently no approved vehicles available to rent.</p>
            </div>
          )}
        </motion.div>
      )}

      {/* CALENDAR OVERLAY */}
      {activeCalendar && selectedVehicle && (
        <div className="calendar-overlay">
          <div className="calendar-popup">
            <h3 className="calendar-title">Select Dates for {selectedVehicle.brand} {selectedVehicle.model}</h3>
            
            <div style={{ background: '#fff', padding: '10px', borderRadius: '12px', marginBottom: '20px' }}>
              <DateRange
                ranges={[selectionRange]}
                onChange={(item: any) => setSelectionRange(item.selection)}
                minDate={new Date()}
                disabledDates={disabledDates}
                rangeColors={['#3b82f6']}
              />
            </div>

            <div className="calendar-actions">
              <button className="btn-danger" onClick={() => setActiveCalendar(null)}>
                Cancel
              </button>
              <button className="btn-primary" disabled={bookingLoading} onClick={bookVehicle}>
                {bookingLoading ? "Processing..." : "Confirm Booking"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRIVER PROMPT MODAL */}
      {driverPromptData && (
        <div className="calendar-overlay">
          <div className="calendar-popup" style={{ textAlign: 'center', padding: '30px' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>🚗</div>
              <h3 className="calendar-title" style={{ fontSize: '24px', marginBottom: '10px' }}>Need a Driver?</h3>
              <p style={{ marginBottom: '25px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Your vehicle has been booked successfully! Would you like to check out available drivers for your trip on <strong>{driverPromptData.startDate}</strong>?
              </p>
              <div className="calendar-actions" style={{ justifyContent: 'center', gap: '15px' }}>
                <button className="btn-ghost" onClick={() => setDriverPromptData(null)}>
                  No, thanks
                </button>
                <button className="btn-primary" onClick={() => {
                  navigate("/customer/drivers", { state: { startDate: driverPromptData.startDate, endDate: driverPromptData.endDate } });
                }}>
                  Yes, show drivers
                </button>
              </div>
            </motion.div>
          </div>
        </div>
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
