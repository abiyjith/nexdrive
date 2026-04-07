import { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc, getDoc, updateDoc, addDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useNavigate } from "react-router-dom";
import { FaCar, FaArrowLeft, FaSearch, FaBan, FaCheck, FaTrash, FaRupeeSign, FaHashtag, FaGasPump } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Toast from "../../components/Toast";
import "../../styles/admin.css";
import "../../styles/app.css";

export default function AdminVehicles() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<any>(null);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const vehicleSnap = await getDocs(collection(db, "vehicles"));
      const bookingSnap = await getDocs(collection(db, "vehicle_bookings"));
      const bookings = bookingSnap.docs.map(d => d.data());

      const list: any[] = [];
      let mostBooked: any = null;
      let topRevenue: any = null;

      for (const v of vehicleSnap.docs) {
        const data = v.data();
        let ownerEmail = "Unknown Owner";

        if (data.owner_id) {
          const ownerSnap = await getDoc(doc(db, "users", data.owner_id));
          if (ownerSnap.exists()) {
            ownerEmail = ownerSnap.data().email;
          }
        }

        /* VEHICLE BOOKINGS */
        const vehicleBookings = bookings.filter(b => b.vehicle_id === v.id);
        const bookingCount = vehicleBookings.length;

        /* VEHICLE REVENUE */
        const revenue = vehicleBookings.reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);

        /* ANALYTICS */
        if (!mostBooked || bookingCount > mostBooked.count) {
          mostBooked = { name: `${data.brand} ${data.model}`, count: bookingCount };
        }

        if (!topRevenue || revenue > topRevenue.revenue) {
          topRevenue = { name: `${data.brand} ${data.model}`, revenue };
        }

        list.push({
          id: v.id,
          ...data,
          ownerEmail,
          bookingCount,
          revenue
        });
      }

      setStats({ mostBooked, topRevenue });
      setVehicles(list);
    } catch (error) {
      console.error("Error loading vehicles:", error);
      setToast({ type: "error", message: "Failed to load vehicles." });
    } finally {
      setLoading(false);
    }
  };

  /* DELETE VEHICLE */
  const deleteVehicle = async (vehicle: any) => {
    const msg = prompt("Send message to owner explaining why the vehicle is being deleted:");
    if (!msg) return;

    try {
      await deleteDoc(doc(db, "vehicles", vehicle.id));

      /* NOTIFICATION */
      await addDoc(collection(db, "notifications"), {
        user_id: vehicle.owner_id,
        message: msg,
        read: false,
        created_at: new Date()
      });

      setToast({ type: "success", message: "Vehicle deleted and owner notified." });
      loadVehicles();
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      setToast({ type: "error", message: "Failed to delete vehicle." });
    }
  };

  /* TOGGLE VEHICLE AVAILABILITY */
  const toggleVehicle = async (vehicle: any) => {
    try {
      await updateDoc(doc(db, "vehicles", vehicle.id), {
        is_available: !vehicle.is_available
      });
      loadVehicles();
      setToast({ type: "success", message: `Vehicle ${vehicle.is_available ? 'disabled' : 'enabled'} successfully.` });
    } catch (error) {
      console.error("Error updating vehicle status:", error);
      setToast({ type: "error", message: "Failed to update vehicle status." });
    }
  };

  /* SEARCH */
  const filteredVehicles = vehicles.filter(v =>
    (v.brand + " " + v.model).toLowerCase().includes(search.toLowerCase()) ||
    (v.vehicle_number || "").toLowerCase().includes(search.toLowerCase()) ||
    (v.ownerEmail || "").toLowerCase().includes(search.toLowerCase())
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
            <FaCar size={32} />
          </div>
          <div>
            <h2 style={{ margin: '0 0 5px 0', fontSize: '28px' }}>Vehicle Management</h2>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Monitor and manage all platform vehicles</p>
          </div>
        </div>
        <button className="btn-ghost" style={{ border: '1px solid var(--border-color)' }} onClick={() => navigate("/admin")}>
          <FaArrowLeft style={{ marginRight: '8px' }}/> Back to Dashboard
        </button>
      </motion.div>

      <div className="admin-content-wrapper" style={{ margin: 0 }}>
        
        {/* ANALYTICS SECTION */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '40px' }}
        >
          <div style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '22px', margin: '0 0 5px 0' }}>Vehicle Performance</h3>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Top performing vehicles on the platform</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            
            <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '25px', borderTop: '4px solid #3b82f6' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', fontSize: '28px' }}>
                <FaCar />
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '12px', margin: '0 0 5px 0' }}>Most Booked</p>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '20px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                  {stats.mostBooked?.name || "N/A"}
                </h3>
                <p style={{ margin: 0, color: '#3b82f6', fontWeight: 'bold' }}>{stats.mostBooked?.count || 0} bookings</p>
              </div>
            </div>

            <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '25px', borderTop: '4px solid #10b981' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '28px' }}>
                <FaRupeeSign />
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '12px', margin: '0 0 5px 0' }}>Top Revenue</p>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '20px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                  {stats.topRevenue?.name || "N/A"}
                </h3>
                <p style={{ margin: 0, color: '#10b981', fontWeight: 'bold' }}>₹{stats.topRevenue?.revenue?.toLocaleString() || 0}</p>
              </div>
            </div>

          </div>
        </motion.section>

        {/* VEHICLE LIST SECTION */}
        <section style={{ background: 'transparent', border: 'none', padding: 0, boxShadow: 'none' }}>
          
          <div style={{ marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '22px', margin: '0 0 5px 0', color: '#fff' }}>All Vehicles</h3>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>Search and moderate fleet listings</p>
            </div>
            
            <div style={{ position: 'relative', width: '300px', maxWidth: '100%' }}>
              <FaSearch style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search by brand, model, number..."
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
              <p style={{ color: 'var(--text-muted)' }}>Loading vehicles...</p>
            </div>
          ) : (
            <motion.div 
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <AnimatePresence>
                {filteredVehicles.map(v => (
                  <motion.div key={v.id} variants={cardVariants} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', padding: 0 }}>
                    
                    {/* Status Ribbon */}
                    <div style={{ 
                      position: 'absolute', top: '15px', right: '-35px', background: v.is_available ? 'var(--accent-success)' : 'var(--accent-danger)', color: '#000', 
                      padding: '5px 40px', transform: 'rotate(45deg)', fontSize: '11px', fontWeight: 'bold', zIndex: 10,
                      boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
                    }}>
                      {v.is_available ? 'ACTIVE' : 'DISABLED'}
                    </div>

                    <div style={{ position: 'relative', height: '180px', overflow: 'hidden', borderBottom: '1px solid var(--border-color)' }}>
                      {v.vehicle_image ? (
                        <img
                          src={v.vehicle_image || 'https://dummyimage.com/400x200/222/fff&text=Unavailable'}
                          onError={(e) => { e.currentTarget.src = 'https://dummyimage.com/400x200/222/fff&text=Unavailable' }}
                          alt={`${v.brand} ${v.model}`}
                          style={{ width: "100%", height: "100%", objectFit: "cover", transition: 'transform 0.5s', ':hover': { transform: 'scale(1.05)' } } as any}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>
                          <FaCar size={50} color="var(--border-color)" />
                        </div>
                      )}
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', padding: '20px 15px 10px 15px' }}>
                        <h3 style={{ margin: 0, color: 'white', fontSize: '20px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{v.brand} {v.model}</h3>
                        <p style={{ margin: '5px 0 0 0', color: '#e2e8f0', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <FaHashtag size={10}/> {v.vehicle_number}
                        </p>
                      </div>
                    </div>

                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                        <div>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Owner</span>
                          <strong style={{ fontSize: '13px', color: '#fff', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={v.ownerEmail}>{v.ownerEmail}</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Price / Day</span>
                          <strong style={{ fontSize: '15px', color: 'var(--accent-success)' }}>₹{v.price_per_day}</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Year & Fuel</span>
                          <strong style={{ fontSize: '13px', color: '#fff', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            {v.year} • <FaGasPump size={12}/> {v.fuel}
                          </strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Performance</span>
                          <strong style={{ fontSize: '13px', color: 'var(--accent-primary)' }}>{v.bookingCount} trips <span style={{ color: 'var(--text-muted)', fontWeight: 'normal', fontSize: '11px' }}>(₹{v.revenue})</span></strong>
                        </div>
                      </div>

                      <div style={{ marginTop: 'auto', display: 'flex', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                        <button
                          className="btn-primary"
                          style={{
                            flex: 1, padding: '8px', fontSize: '13px',
                            background: v.is_available ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)', 
                            color: v.is_available ? 'var(--accent-warning)' : 'var(--accent-success)', 
                            border: `1px solid ${v.is_available ? 'rgba(245,158,11,0.3)' : 'rgba(34,197,94,0.3)'}`,
                            boxShadow: 'none'
                          }}
                          onClick={() => toggleVehicle(v)}
                        >
                          {v.is_available ? <><FaBan style={{marginRight:'5px'}}/> Disable</> : <><FaCheck style={{marginRight:'5px'}}/> Enable</>}
                        </button>

                        <button
                          className="btn-ghost"
                          style={{
                            flex: 1, padding: '8px', fontSize: '13px',
                            background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-danger)', 
                            border: '1px solid rgba(239, 68, 68, 0.3)'
                          }}
                          onClick={() => deleteVehicle(v)}
                        >
                          <FaTrash style={{marginRight:'5px'}}/> Delete
                        </button>
                      </div>

                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {!loading && filteredVehicles.length === 0 && (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', marginTop: '20px' }}>
              <FaCar size={60} style={{ color: 'var(--text-muted)', marginBottom: '20px' }} />
              <h3 style={{ margin: '0 0 10px 0' }}>No vehicles found</h3>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>Try adjusting your search criteria.</p>
            </div>
          )}

        </section>

      </div>

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
