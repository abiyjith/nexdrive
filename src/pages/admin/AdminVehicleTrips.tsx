import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useNavigate } from "react-router-dom";
import { FaClipboardList, FaArrowLeft, FaEye, FaTimes, FaCalendarAlt, FaUser, FaCar, FaMapMarkerAlt, FaRupeeSign, FaCreditCard, FaSearch } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import "../../styles/admin.css";
import "../../styles/app.css";

export default function AdminVehicleTrips() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<any[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "vehicle_bookings"));
      const list: any = [];

      for (const d of snap.docs) {
        const data = d.data();
        let customerName = "Unknown Customer";
        let vehicleName = "Unknown Vehicle";
        let customerEmail = "";

        if (data.customer_id) {
          const userSnap = await getDoc(doc(db, "users", data.customer_id));
          if (userSnap.exists()) {
            customerName = userSnap.data().first_name + " " + (userSnap.data().last_name || "");
            customerEmail = userSnap.data().email;
          }
        }

        if (data.vehicle_id) {
          const vehicleSnap = await getDoc(doc(db, "vehicles", data.vehicle_id));
          if (vehicleSnap.exists()) {
            vehicleName = vehicleSnap.data().brand + " " + vehicleSnap.data().model;
          }
        }

        list.push({
          id: d.id,
          ...data,
          customerName,
          customerEmail,
          vehicleName
        });
      }

      // Sort by newest start date
      list.sort((a: any, b: any) => {
        return new Date(b.start_date || 0).getTime() - new Date(a.start_date || 0).getTime();
      });

      setTrips(list);
    } catch (error) {
      console.error("Error loading trips:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'completed': return 'var(--accent-success)';
      case 'active': return 'var(--accent-primary)';
      case 'cancelled': return 'var(--accent-danger)';
      default: return 'var(--accent-warning)';
    }
  };

  const getStatusBg = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'completed': return 'rgba(16, 185, 129, 0.1)';
      case 'active': return 'rgba(59, 130, 246, 0.1)';
      case 'cancelled': return 'rgba(239, 68, 68, 0.1)';
      default: return 'rgba(245, 158, 11, 0.1)';
    }
  };

  const filteredTrips = trips.filter(t => 
    t.vehicleName.toLowerCase().includes(search.toLowerCase()) ||
    t.customerName.toLowerCase().includes(search.toLowerCase()) ||
    (t.status || "").toLowerCase().includes(search.toLowerCase())
  );

  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const cardVariants: any = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <div className="page-container" style={{ maxWidth: '1400px', margin: '0 auto', background: 'var(--bg-dark)', minHeight: '100vh', padding: '30px' }}>
      
      {/* HEADER SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel" 
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 30px', marginBottom: '40px', borderLeft: '4px solid var(--accent-primary)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', padding: '15px', borderRadius: '12px' }}>
            <FaClipboardList size={32} />
          </div>
          <div>
            <h2 style={{ margin: '0 0 5px 0', fontSize: '28px' }}>Vehicle Trips</h2>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Monitor self-drive vehicle bookings</p>
          </div>
        </div>
        <button className="btn-ghost" style={{ border: '1px solid var(--border-color)' }} onClick={() => navigate("/admin")}>
          <FaArrowLeft style={{ marginRight: '8px' }}/> Back to Dashboard
        </button>
      </motion.div>

      <div className="admin-content-wrapper" style={{ margin: 0 }}>
        <section style={{ background: 'transparent', border: 'none', padding: 0, boxShadow: 'none' }}>
          
          <div style={{ marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '22px', margin: '0 0 5px 0', color: '#fff' }}>Trip Logs</h3>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>History of all self-drive rentals</p>
            </div>
            
            <div style={{ position: 'relative', width: '300px', maxWidth: '100%' }}>
              <FaSearch style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search vehicles, customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input"
                style={{ width: '100%', paddingLeft: '45px', background: 'var(--bg-glass)' }}
              />
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', margin: '60px 0' }}>
              <div className="spinner" style={{ fontSize: '30px', color: 'var(--accent-primary)', marginBottom: '15px' }} />
              <p style={{ color: 'var(--text-muted)' }}>Loading trips...</p>
            </div>
          ) : (
            <motion.div 
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '25px' }}
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <AnimatePresence>
                {filteredTrips.map(t => (
                  <motion.div key={t.id} variants={cardVariants} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                    
                    {/* Status Ribbon */}
                    <div style={{ 
                      position: 'absolute', top: '15px', right: '-35px', background: getStatusColor(t.status), color: '#000', 
                      padding: '5px 40px', transform: 'rotate(45deg)', fontSize: '11px', fontWeight: 'bold', zIndex: 10,
                      boxShadow: '0 2px 10px rgba(0,0,0,0.3)', textTransform: 'uppercase'
                    }}>
                      {t.status || 'Unknown'}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', marginBottom: '20px', paddingRight: '40px' }}>
                      <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', flexShrink: 0 }}>
                        <FaCar size={20} />
                      </div>
                      <div>
                        <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '220px' }} title={t.vehicleName}>
                          {t.vehicleName}
                        </h3>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <FaUser size={10}/> {t.customerName}
                        </p>
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-dark)', padding: '15px', borderRadius: '12px', marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                        <FaCalendarAlt color="var(--accent-primary)" style={{ width: '16px' }} />
                        <span style={{ color: 'var(--text-muted)' }}>From:</span> 
                        <strong style={{ color: '#fff' }}>{t.start_date ? new Date(t.start_date).toLocaleDateString('en-GB') : 'N/A'}</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                        <FaCalendarAlt color="var(--accent-warning)" style={{ width: '16px' }} />
                        <span style={{ color: 'var(--text-muted)' }}>To:</span> 
                        <strong style={{ color: '#fff' }}>{t.end_date ? new Date(t.end_date).toLocaleDateString('en-GB') : 'N/A'}</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                        <FaRupeeSign color="var(--accent-success)" style={{ width: '16px' }} />
                        <span style={{ color: 'var(--text-muted)' }}>Total:</span> 
                        <strong style={{ color: 'var(--accent-success)' }}>₹{t.total_price || 0}</strong>
                        {t.payment_status === 'paid' && <span style={{ fontSize: '10px', background: 'var(--accent-success)', color: '#000', padding: '2px 6px', borderRadius: '10px', marginLeft: 'auto' }}>PAID</span>}
                      </div>
                    </div>

                    <div style={{ marginTop: 'auto', display: 'flex' }}>
                      <button
                        className="btn-ghost"
                        style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', color: 'var(--text-muted)', display: 'flex', justifyContent: 'center', gap: '8px' }}
                        onClick={() => setSelectedTrip(t)}
                      >
                        <FaEye size={16}/> View Full Details
                      </button>
                    </div>

                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {!loading && filteredTrips.length === 0 && (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', marginTop: '20px' }}>
              <FaClipboardList size={60} style={{ color: 'var(--text-muted)', marginBottom: '20px' }} />
              <h3 style={{ margin: '0 0 10px 0' }}>No trips found</h3>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>Try adjusting your search criteria.</p>
            </div>
          )}

        </section>
      </div>

      {/* POPUP OVERLAY */}
      <AnimatePresence>
        {selectedTrip && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="popup-overlay" 
            onClick={() => setSelectedTrip(null)}
            style={{ backdropFilter: 'blur(8px)', zIndex: 9999 }}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-panel" 
              onClick={e => e.stopPropagation()} 
              style={{ width: '500px', maxWidth: '95%', padding: '30px', position: 'relative', border: '1px solid var(--border-color)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}><FaClipboardList color="var(--accent-primary)"/> Trip Complete Details</h3>
                <button className="btn-ghost" style={{ padding: '8px', border: 'none' }} onClick={() => setSelectedTrip(null)}>
                  <FaTimes size={20} color="var(--text-muted)"/>
                </button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: 'var(--bg-glass)', borderRadius: '12px' }}>
                  <FaCar size={24} color="var(--accent-primary)" />
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Vehicle</span>
                    <strong style={{ fontSize: '16px', color: '#fff' }}>{selectedTrip.vehicleName}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: 'var(--bg-glass)', borderRadius: '12px' }}>
                  <FaUser size={24} color="var(--accent-primary)" />
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Customer</span>
                    <strong style={{ fontSize: '16px', color: '#fff', display: 'block' }}>{selectedTrip.customerName}</strong>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{selectedTrip.customerEmail}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div style={{ padding: '15px', background: 'var(--bg-dark)', borderRadius: '12px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Start Date</span>
                    <strong style={{ color: '#fff' }}>{selectedTrip.start_date || 'N/A'}</strong>
                  </div>
                  <div style={{ padding: '15px', background: 'var(--bg-dark)', borderRadius: '12px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>End Date</span>
                    <strong style={{ color: '#fff' }}>{selectedTrip.end_date || 'N/A'}</strong>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div style={{ padding: '15px', background: 'var(--bg-dark)', borderRadius: '12px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Status</span>
                    <strong style={{ color: getStatusColor(selectedTrip.status), textTransform: 'uppercase' }}>{selectedTrip.status || 'Unknown'}</strong>
                  </div>
                  <div style={{ padding: '15px', background: 'var(--bg-dark)', borderRadius: '12px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Distance Travelled</span>
                    <strong style={{ color: '#fff' }}>{selectedTrip.distance_travelled || 0} KM</strong>
                  </div>
                </div>

                <div style={{ padding: '15px', background: 'var(--bg-dark)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Payment Info</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <strong style={{ color: '#fff', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FaCreditCard/> {selectedTrip.payment_method || 'N/A'}
                      </strong>
                      <span style={{ fontSize: '11px', background: getStatusBg(selectedTrip.payment_status === 'paid' ? 'completed' : 'cancelled'), color: getStatusColor(selectedTrip.payment_status === 'paid' ? 'completed' : 'cancelled'), padding: '2px 8px', borderRadius: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                        {selectedTrip.payment_status || 'Pending'}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Total Amount</span>
                    <strong style={{ fontSize: '24px', color: 'var(--accent-success)' }}>₹{selectedTrip.total_price || 0}</strong>
                  </div>
                </div>

              </div>

              <button
                className="btn-primary"
                style={{ marginTop: '25px', width: '100%', padding: '12px' }}
                onClick={() => setSelectedTrip(null)}
              >
                Close Details
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
