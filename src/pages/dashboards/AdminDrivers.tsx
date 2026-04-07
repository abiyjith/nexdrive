import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useNavigate } from "react-router-dom";
import { FaRoute, FaArrowLeft, FaEye, FaTrash, FaTimes, FaUserAlt, FaMapMarkerAlt, FaCalendarAlt, FaCreditCard, FaSearch, FaClipboardCheck } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Toast from "../../components/Toast";
import "../../styles/admin.css";
import "../../styles/app.css";

export default function AdminDrivers() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<any[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<any>(null);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "driver_bookings"));
      const list: any = [];

      for (const d of snap.docs) {
        const data = d.data();
        let driverName = "Unknown Driver";
        let customerName = "Unknown Customer";
        let driverEmail = "";
        let customerEmail = "";

        if (data.driver_id) {
          const driverSnap = await getDoc(doc(db, "users", data.driver_id));
          if (driverSnap.exists()) {
            driverName = driverSnap.data().first_name + " " + (driverSnap.data().last_name || "");
            driverEmail = driverSnap.data().email;
          }
        }

        if (data.customer_id) {
          const customerSnap = await getDoc(doc(db, "users", data.customer_id));
          if (customerSnap.exists()) {
            customerName = customerSnap.data().first_name + " " + (customerSnap.data().last_name || "");
            customerEmail = customerSnap.data().email;
          }
        }

        list.push({
          id: d.id,
          ...data,
          driverName,
          driverEmail,
          customerName,
          customerEmail
        });
      }

      // Sort by newest date
      list.sort((a: any, b: any) => {
        return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
      });

      setTrips(list);
    } catch (error) {
      console.error("Error loading driver trips:", error);
      setToast({ type: "error", message: "Failed to load driver trips." });
    } finally {
      setLoading(false);
    }
  };

  const deleteTrip = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this trip record? This cannot be undone.")) return;
    
    try {
      await deleteDoc(doc(db, "driver_bookings", id));
      setTrips(trips.filter(t => t.id !== id));
      setToast({ type: "success", message: "Trip deleted successfully." });
    } catch (error) {
      console.error("Error deleting trip:", error);
      setToast({ type: "error", message: "Failed to delete trip." });
    }
  };

  const getStatusColor = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'completed': return 'var(--accent-success)';
      case 'active': case 'accepted': return 'var(--accent-primary)';
      case 'cancelled': case 'rejected': return 'var(--accent-danger)';
      default: return 'var(--accent-warning)';
    }
  };

  const filteredTrips = trips.filter(t => 
    t.driverName.toLowerCase().includes(search.toLowerCase()) ||
    t.customerName.toLowerCase().includes(search.toLowerCase()) ||
    (t.pickup_location || "").toLowerCase().includes(search.toLowerCase()) ||
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
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 30px', marginBottom: '40px', borderLeft: '4px solid #f59e0b' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '15px', borderRadius: '12px' }}>
            <FaRoute size={32} />
          </div>
          <div>
            <h2 style={{ margin: '0 0 5px 0', fontSize: '28px' }}>Driver Trips</h2>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Monitor driver hires and trip statuses</p>
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
              <h3 style={{ fontSize: '22px', margin: '0 0 5px 0', color: '#fff' }}>Recent Driver Hires</h3>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>Log of all driver services requested on the platform</p>
            </div>
            
            <div style={{ position: 'relative', width: '300px', maxWidth: '100%' }}>
              <FaSearch style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search drivers, customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input"
                style={{ width: '100%', paddingLeft: '45px', background: 'var(--bg-glass)' }}
              />
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', margin: '60px 0' }}>
              <div className="spinner" style={{ fontSize: '30px', color: '#f59e0b', marginBottom: '15px' }} />
              <p style={{ color: 'var(--text-muted)' }}>Loading records...</p>
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
                      {t.status || 'Pending'}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', marginBottom: '20px', paddingRight: '40px' }}>
                      <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', flexShrink: 0 }}>
                        <FaRoute size={20} />
                      </div>
                      <div style={{ width: '100%' }}>
                        <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FaCalendarAlt size={12}/> Trip: {t.date ? new Date(t.date).toLocaleDateString() : 'Unknown Date'}
                        </h3>
                        
                        <div style={{ background: 'var(--bg-dark)', padding: '10px', borderRadius: '8px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--bg-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <FaUserAlt size={10} color="#3b82f6" />
                            </div>
                            <div style={{ lineHeight: '1.2' }}>
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Driver</span>
                              <strong style={{ fontSize: '14px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px', display: 'block' }}>{t.driverName}</strong>
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--bg-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <FaUserAlt size={10} color="#10b981" />
                            </div>
                            <div style={{ lineHeight: '1.2' }}>
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Customer</span>
                              <strong style={{ fontSize: '14px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px', display: 'block' }}>{t.customerName}</strong>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>

                    <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
                      <button
                        className="btn-ghost"
                        style={{ flex: 1, padding: '10px', border: '1px solid var(--border-color)', color: 'var(--text-muted)', display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '13px' }}
                        onClick={() => setSelectedTrip(t)}
                      >
                        <FaEye size={14}/> View Details
                      </button>
                      <button
                        className="btn-ghost"
                        style={{ padding: '10px 15px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--accent-danger)' }}
                        onClick={(e) => { e.stopPropagation(); deleteTrip(t.id); }}
                        title="Delete Trip Record"
                      >
                        <FaTrash size={14}/>
                      </button>
                    </div>

                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {!loading && filteredTrips.length === 0 && (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', marginTop: '20px' }}>
              <FaRoute size={60} style={{ color: 'var(--text-muted)', marginBottom: '20px' }} />
              <h3 style={{ margin: '0 0 10px 0' }}>No pilot trips found</h3>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>Try adjusting your search query.</p>
            </div>
          )}

        </section>
      </div>

      {/* POPUP DETAILS */}
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
              style={{ width: '500px', maxWidth: '95%', padding: '30px', position: 'relative', border: '1px solid #f59e0b', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}><FaRoute color="#f59e0b"/> Hiring Details</h3>
                <button className="btn-ghost" style={{ padding: '8px', border: 'none' }} onClick={() => setSelectedTrip(null)}>
                  <FaTimes size={20} color="var(--text-muted)"/>
                </button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '15px', background: 'var(--bg-glass)', borderRadius: '12px' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FaUserAlt size={12} color="#3b82f6" />
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Driver</span>
                      <strong style={{ fontSize: '14px', color: '#fff', display: 'block' }}>{selectedTrip.driverName}</strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{selectedTrip.driverEmail}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '15px', background: 'var(--bg-glass)', borderRadius: '12px' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FaUserAlt size={12} color="#10b981" />
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Customer</span>
                      <strong style={{ fontSize: '14px', color: '#fff', display: 'block' }}>{selectedTrip.customerName}</strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{selectedTrip.customerEmail}</span>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '15px', background: 'var(--bg-dark)', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                  <FaMapMarkerAlt color="#ef4444" size={20} style={{ marginTop: '2px' }} />
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Pickup Location</span>
                    <strong style={{ color: '#fff', lineHeight: '1.4', display: 'block' }}>{selectedTrip.pickup_location || 'Not Specified'}</strong>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div style={{ padding: '15px', background: 'var(--bg-dark)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaCalendarAlt color="var(--accent-primary)"/>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Date</span>
                      <strong style={{ color: '#fff', fontSize: '14px' }}>{selectedTrip.date || 'N/A'}</strong>
                    </div>
                  </div>
                  <div style={{ padding: '15px', background: 'var(--bg-dark)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaClipboardCheck color={getStatusColor(selectedTrip.status)}/>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Trip Status</span>
                      <strong style={{ color: getStatusColor(selectedTrip.status), textTransform: 'uppercase', fontSize: '13px' }}>{selectedTrip.status || 'Pending'}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '15px', background: 'var(--bg-dark)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Payment Info</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <strong style={{ color: '#fff', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FaCreditCard/> {selectedTrip.payment_method || 'N/A'}
                      </strong>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Payment Status</span>
                    <span style={{ 
                      fontSize: '12px', 
                      background: selectedTrip.payment_status === 'paid' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)', 
                      color: selectedTrip.payment_status === 'paid' ? 'var(--accent-success)' : 'var(--accent-warning)', 
                      padding: '4px 10px', 
                      borderRadius: '12px', 
                      textTransform: 'uppercase', 
                      fontWeight: 'bold',
                      border: `1px solid ${selectedTrip.payment_status === 'paid' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(245, 158, 11, 0.5)'}`
                    }}>
                      {selectedTrip.payment_status || 'Pending'}
                    </span>
                  </div>
                </div>

              </div>

              <button
                className="btn-primary"
                style={{ marginTop: '25px', width: '100%', padding: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', boxShadow: 'none' }}
                onClick={() => setSelectedTrip(null)}
              >
                Close Summary
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
    
