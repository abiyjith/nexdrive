import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaArrowLeft, FaBan, FaCheckCircle, FaUserShield, FaCar, FaRoute, FaCalendarAlt, FaEnvelope } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Toast from "../../components/Toast";
import "../../styles/admin.css";
import "../../styles/app.css";

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const vehicleBookingsSnap = await getDocs(collection(db, "vehicle_bookings"));
        const driverBookingsSnap = await getDocs(collection(db, "driver_bookings"));

        const vehicleBookings = vehicleBookingsSnap.docs.map(d => d.data());
        const driverBookings = driverBookingsSnap.docs.map(d => d.data());

        const userList = usersSnap.docs.map(d => {
          const data = d.data();
          const id = d.id;

          /* vehicle bookings count */
          const vehicleCount = vehicleBookings.filter(b => b.customer_id === id).length;

          /* driver hires count */
          const driverCount = driverBookings.filter(b => b.customer_id === id).length;

          return {
            id,
            ...data,
            vehicleBookings: vehicleCount,
            driverHires: driverCount
          };
        });

        // Sort by newest first, assuming created_at exists
        userList.sort(function(a: any, b: any) {
          const dateA = a.created_at?.seconds || 0;
          const dateB = b.created_at?.seconds || 0;
          return dateB - dateA;
        });

        setUsers(userList);
      } catch (error) {
        console.error("Error loading users:", error);
        setToast({ type: "error", message: "Failed to load users." });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const toggleBanStatus = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const action = newStatus ? "ban" : "unban";
    
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      await updateDoc(doc(db, "users", id), {
        banned: newStatus
      });
      
      setUsers(users.map(u => u.id === id ? { ...u, banned: newStatus } : u));
      setToast({ type: "success", message: `User successfully ${action}ned.` });
    } catch (error) {
      console.error(`Error ${action}ning user:`, error);
      setToast({ type: "error", message: `Failed to ${action} user.` });
    }
  };

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
            <FaUsers size={32} />
          </div>
          <div>
            <h2 style={{ margin: '0 0 5px 0', fontSize: '28px' }}>User Management</h2>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>View and moderate platform users</p>
          </div>
        </div>
        <button className="btn-ghost" style={{ border: '1px solid var(--border-color)' }} onClick={() => navigate("/admin")}>
          <FaArrowLeft style={{ marginRight: '8px' }}/> Back to Dashboard
        </button>
      </motion.div>

      <div className="admin-content-wrapper" style={{ margin: 0 }}>
        <section className="admin-section" style={{ background: 'transparent', border: 'none', padding: 0, boxShadow: 'none' }}>
          
          <div style={{ marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h3 style={{ fontSize: '22px', margin: '0 0 5px 0', color: '#fff' }}>All Registered Users</h3>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>Total accounts on the platform: {users.length}</p>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', margin: '60px 0' }}>
              <div className="spinner" style={{ fontSize: '30px', color: 'var(--accent-primary)', marginBottom: '15px' }} />
              <p style={{ color: 'var(--text-muted)' }}>Loading users...</p>
            </div>
          ) : (
            <motion.div 
              className="admin-grid" 
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <AnimatePresence>
                {users.map(u => (
                  <motion.div key={u.id} variants={cardVariants} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                    
                    {/* Top Accent Line indicating ban status */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: u.banned ? 'var(--accent-danger)' : 'var(--accent-success)' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', marginTop: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'var(--bg-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                          <FaUserShield size={20} />
                        </div>
                        <div>
                          <h3 style={{ color: 'white', margin: '0 0 4px 0', fontSize: '18px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {u.first_name ? `${u.first_name} ${u.last_name || ''}` : "Unnamed User"}
                          </h3>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <FaEnvelope /> <span style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</span>
                          </div>
                        </div>
                      </div>
                      
                      <span style={{ 
                        background: u.banned ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                        color: u.banned ? 'var(--accent-danger)' : 'var(--accent-success)', 
                        padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px',
                        border: `1px solid ${u.banned ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                      }}>
                        {u.banned ? <><FaBan/> Banned</> : <><FaCheckCircle/> Active</>}
                      </span>
                    </div>

                    <div style={{ background: 'var(--bg-dark)', padding: '15px', borderRadius: '12px', marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Role</span>
                        <strong style={{ textTransform: 'capitalize', fontSize: '14px', color: '#fff' }}>{u.role || "customer"}</strong>
                      </div>

                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Joined</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#fff' }}>
                          <FaCalendarAlt color="var(--accent-primary)" /> {u.created_at ? new Date(u.created_at.seconds*1000).toLocaleDateString('en-GB') : "Unknown"}
                        </div>
                      </div>

                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Driver Hires</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', color: '#fff' }}>
                          <FaRoute color="#f59e0b" /> <strong>{u.driverHires}</strong> trips
                        </div>
                      </div>

                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Vehicle Bookings</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', color: '#fff' }}>
                          <FaCar color="#8b5cf6" /> <strong>{u.vehicleBookings}</strong> rentals
                        </div>
                      </div>

                    </div>

                    <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={() => toggleBanStatus(u.id, !!u.banned)}
                        className="btn-primary" 
                        style={{ 
                          flex: 1, 
                          background: u.banned ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                          color: u.banned ? 'var(--accent-success)' : 'var(--accent-danger)', 
                          border: `1px solid ${u.banned ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                          boxShadow: 'none'
                        }} 
                      >
                        {u.banned ? <><FaCheckCircle size={16}/> Lift Ban</> : <><FaBan size={16}/> Ban User</>}
                      </button>
                    </div>

                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
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
