import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { logout } from "../../lib/logout";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { motion } from "framer-motion";

// Icons
import { 
  FaUsers, FaCar, FaRoute, FaWallet, 
  FaUserShield, FaExclamationTriangle, FaClipboardList,
  FaCarSide, FaSignOutAlt, FaTachometerAlt
} from "react-icons/fa";

import "../../styles/admin.css";
import "../../styles/app.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  /* =========================
     ANALYTICS STATES
  ========================= */
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [vehicleTrips, setVehicleTrips] = useState(0);
  const [driverTrips, setDriverTrips] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [pendingRoles, setPendingRoles] = useState(0);
  const [pendingVehicles, setPendingVehicles] = useState(0);
  const [pendingReports, setPendingReports] = useState(0);
  const [loading, setLoading] = useState(true);

  /* =========================
     LOAD ANALYTICS
  ========================= */
  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      /* USERS */
      const usersSnap = await getDocs(collection(db, "users"));
      setTotalUsers(usersSnap.size);

      /* VEHICLES */
      const vehicleSnap = await getDocs(collection(db, "vehicles"));
      setTotalVehicles(vehicleSnap.size);

      /* VEHICLE BOOKINGS */
      const bookingSnap = await getDocs(collection(db, "vehicle_bookings"));
      setVehicleTrips(bookingSnap.size);

      let revenue = 0;
      bookingSnap.docs.forEach(d => {
        const data = d.data();
        if (data.payment_status === "paid") {
          revenue += Number(data.total_price || 0);
        }
      });

      /* DRIVER BOOKINGS */
      const driverSnap = await getDocs(collection(db, "driver_bookings"));
      setDriverTrips(driverSnap.size);

      /* ROLE REQUESTS */
      const roleSnap = await getDocs(
        query(collection(db, "role_requests"), where("status", "==", "pending"))
      );
      setPendingRoles(roleSnap.size);

      /* VEHICLE REQUESTS */
      const vehicleReqSnap = await getDocs(
        query(collection(db, "vehicles"), where("status", "==", "pending"))
      );
      setPendingVehicles(vehicleReqSnap.size);

      /* REPORTS */
      const reportSnap = await getDocs(collection(db, "reports"));
      const pending = reportSnap.docs.filter(r => r.data().status !== "resolved");
      setPendingReports(pending.length);

      /* TOTAL REVENUE */
      setTotalRevenue(revenue);
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     LOGOUT
  ========================= */
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-dark)' }}>
        <div className="spinner" style={{ fontSize: '40px', color: 'var(--accent-primary)' }}><FaTachometerAlt /></div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '1400px', margin: '0 auto', background: 'var(--bg-dark)', minHeight: '100vh' }}>
      
      {/* HEADER SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel" 
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 30px', marginBottom: '40px', borderLeft: '4px solid var(--accent-primary)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', padding: '15px', borderRadius: '12px' }}>
            <FaTachometerAlt size={32} />
          </div>
          <div>
            <h2 style={{ margin: '0 0 5px 0', fontSize: '28px' }}>Admin Dashboard</h2>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Welcome back, manage your platform efficiently.</p>
          </div>
        </div>
        <button className="btn-ghost" style={{ border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--accent-danger)' }} onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}
      >
        
        {/* =========================
            PLATFORM ANALYTICS 
        ========================= */ }
        <motion.section variants={itemVariants}>
          <div style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '22px', margin: '0 0 5px 0' }}>Overview Metrics</h3>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>High-level platform statistics and performance</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            
            <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '25px', borderTop: '4px solid #3b82f6' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', fontSize: '28px' }}>
                <FaUsers />
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '12px', margin: '0 0 5px 0' }}>Total Users</p>
                <h3 style={{ margin: 0, fontSize: '32px' }}>{totalUsers}</h3>
              </div>
            </div>

            <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '25px', borderTop: '4px solid #10b981' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '28px' }}>
                <FaWallet />
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '12px', margin: '0 0 5px 0' }}>Total Revenue</p>
                <h3 style={{ margin: 0, fontSize: '32px' }}>₹{totalRevenue.toLocaleString()}</h3>
              </div>
            </div>

            <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '25px', borderTop: '4px solid #8b5cf6' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', fontSize: '28px' }}>
                <FaCar />
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '12px', margin: '0 0 5px 0' }}>Registered Vehicles</p>
                <h3 style={{ margin: 0, fontSize: '32px' }}>{totalVehicles}</h3>
              </div>
            </div>

            <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '25px', borderTop: '4px solid #f59e0b' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', fontSize: '28px' }}>
                <FaRoute />
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '12px', margin: '0 0 5px 0' }}>Total Trips</p>
                <h3 style={{ margin: 0, fontSize: '32px' }}>{vehicleTrips + driverTrips}</h3>
              </div>
            </div>

          </div>
        </motion.section>

        {/* =========================
            SYSTEM ALERTS 
        ========================= */ }
        {(pendingRoles > 0 || pendingVehicles > 0 || pendingReports > 0) && (
          <motion.section variants={itemVariants}>
            <div style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '22px', margin: '0 0 5px 0', color: 'var(--accent-warning)' }}>Action Required</h3>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>Tasks that need your immediate attention</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              
              {pendingRoles > 0 && (
                <div className="glass-panel" style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid var(--accent-warning)', padding: '20px' }} onClick={() => navigate("/admin/requests")}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-warning)', padding: '12px', borderRadius: '10px', fontSize: '24px' }}><FaUserShield /></div>
                    <div>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>Role Requests</h3>
                      <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px' }}>Driver & Owner approvals</p>
                    </div>
                  </div>
                  <span style={{ background: 'var(--accent-warning)', color: '#000', padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold' }}>{pendingRoles}</span>
                </div>
              )}

              {pendingVehicles > 0 && (
                <div className="glass-panel" style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid var(--accent-warning)', padding: '20px' }} onClick={() => navigate("/admin/vehicles-requests")}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-warning)', padding: '12px', borderRadius: '10px', fontSize: '24px' }}><FaCarSide /></div>
                    <div>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>Vehicle Approvals</h3>
                      <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px' }}>Pending registrations</p>
                    </div>
                  </div>
                  <span style={{ background: 'var(--accent-warning)', color: '#000', padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold' }}>{pendingVehicles}</span>
                </div>
              )}

              {pendingReports > 0 && (
                <div className="glass-panel" style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid var(--accent-danger)', padding: '20px' }} onClick={() => navigate("/admin/reports")}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-danger)', padding: '12px', borderRadius: '10px', fontSize: '24px' }}><FaExclamationTriangle /></div>
                    <div>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>Open Reports</h3>
                      <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px' }}>User complaints & issues</p>
                    </div>
                  </div>
                  <span style={{ background: 'var(--accent-danger)', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold', boxShadow: '0 0 10px rgba(239, 68, 68, 0.4)' }}>{pendingReports}</span>
                </div>
              )}

            </div>
          </motion.section>
        )}

        {/* =========================
            ADMIN CONTROLS
        ========================= */ }
        <motion.section variants={itemVariants}>
          <div style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '22px', margin: '0 0 5px 0' }}>Management Modules</h3>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Quick access to administration areas</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            
            <button className="glass-panel" style={{ textAlign: 'left', padding: '25px', display: 'flex', flexDirection: 'column', gap: '15px', border: '1px solid var(--border-color)' }} onClick={() => navigate("/admin/users")}>
              <FaUsers style={{ fontSize: '32px', color: 'var(--accent-primary)' }} />
              <div>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '18px',color: '#fff'}}>Users</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px' }}>Manage user accounts & bans</p>
              </div>
            </button>

            <button className="glass-panel" style={{ textAlign: 'left', padding: '25px', display: 'flex', flexDirection: 'column', gap: '15px', border: '1px solid var(--border-color)' }} onClick={() => navigate("/admin/vehicles")}>
              <FaCar style={{ fontSize: '32px', color: 'var(--accent-primary)' }} />
              <div>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' ,color: '#fff'}}>Vehicles</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px' }}>View & manage fleet listings</p>
              </div>
            </button>

            <button className="glass-panel" style={{ textAlign: 'left', padding: '25px', display: 'flex', flexDirection: 'column', gap: '15px', border: '1px solid var(--border-color)' }} onClick={() => navigate("/admin/vehicle-trips")}>
              <FaClipboardList style={{ fontSize: '32px', color: 'var(--accent-primary)' }} />
              <div>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' ,color: '#fff'}}>Vehicle Trips</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px' }}>Monitor self-drive bookings</p>
              </div>
            </button>

            <button className="glass-panel" style={{ textAlign: 'left', padding: '25px', display: 'flex', flexDirection: 'column', gap: '15px', border: '1px solid var(--border-color)' }} onClick={() => navigate("/admin/drivers")}>
              <FaRoute style={{ fontSize: '32px', color: 'var(--accent-primary)' }} />
              <div>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' ,color: '#fff'}}>Driver Trips</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px' }}>Monitor driver bookings</p>
              </div>
            </button>

          </div>
        </motion.section>
        
      </motion.div>
    </div>
  );
}
