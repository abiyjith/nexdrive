import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { switchRole } from "../../lib/roleHelpers";
import { db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Toast from "../../components/Toast";
import { motion } from "framer-motion";
import { FaCar, FaUserTie, FaUser, FaCheckCircle, FaClock, FaExchangeAlt } from "react-icons/fa";
import "../../styles/owner.css";
import "../../styles/app.css";

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [driverApproved, setDriverApproved] = useState(false);
  const [driverPending, setDriverPending] = useState(false);
  const [toast, setToast] = useState<any>(null);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  useEffect(() => {
    loadUserRoles();
  }, [user]);

  const loadUserRoles = async () => {
    if (!user) return;
    const snap = await getDoc(doc(db, "users", user.uid));
    if (!snap.exists()) return;
    const data = snap.data();

    /* DRIVER ROLE CHECK */
    if (data.roles?.includes("driver")) {
      setDriverApproved(true);
    }
    if (data.driver_request === "pending") {
      setDriverPending(true);
    }
  };

  const handleRoleSwitch = async (role: string) => {
    setLoadingRole(role);
    try {
      await switchRole(user!.uid, role);
      setToast({ type: "success", message: `Switched to ${role.charAt(0).toUpperCase() + role.slice(1)} Dashboard` });
    } catch (error) {
      setToast({ type: "error", message: "Error switching role. Please try again." });
    }
    setLoadingRole(null);
  };

  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <div className="page-container">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '40px' }}
      >
        <h1 className="gradient-text" style={{ fontSize: '36px', marginBottom: '8px' }}>
          Owner Dashboard
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your vehicles and switch between your active roles.</p>
      </motion.div>

      <motion.div 
        className="modern-grid"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* CURRENT ROLE CARD */}
        <motion.div variants={itemVariants} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            <FaCar size={36} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>Vehicle Owner</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>Active Session</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-success)', background: 'rgba(16, 185, 129, 0.1)', padding: '6px 16px', borderRadius: '100px', fontSize: '13px', fontWeight: 'bold' }}>
            <FaCheckCircle /> Online
          </div>
        </motion.div>

        {/* ROLE SWITCHING CARD */}
        <motion.div variants={itemVariants} className="glass-panel" style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
            <div style={{ background: 'var(--bg-glass)', padding: '12px', borderRadius: '12px' }}>
              <FaExchangeAlt size={24} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '20px' }}>Switch Roles</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>Access your other dashboards</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            {/* Customer Switch */}
            <button 
              className="btn-ghost"
              style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', border: '1px solid var(--border-color)', height: '100%' }}
              onClick={() => handleRoleSwitch("customer")}
              disabled={loadingRole === "customer"}
            >
              <FaUser size={30} style={{ color: 'var(--text-muted)' }} />
              <div>
                <strong style={{ display: 'block', fontSize: '16px', marginBottom: '4px' }}>Customer</strong>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Book vehicles & drivers</span>
              </div>
              {loadingRole === "customer" && <span className="spinner" style={{ marginTop: '10px' }}></span>}
            </button>

            {/* Driver Switch */}
            {driverApproved ? (
              <button 
                className="btn-ghost"
                style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', border: '1px solid var(--border-color)', height: '100%' }}
                onClick={() => handleRoleSwitch("driver")}
                disabled={loadingRole === "driver"}
              >
                <FaUserTie size={30} style={{ color: 'var(--accent-success)' }} />
                <div>
                  <strong style={{ display: 'block', fontSize: '16px', marginBottom: '4px' }}>Driver</strong>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Manage your trips</span>
                </div>
                {loadingRole === "driver" && <span className="spinner" style={{ marginTop: '10px' }}></span>}
              </button>
            ) : driverPending ? (
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', border: '1px dashed rgba(245, 158, 11, 0.4)', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.05)', height: '100%' }}>
                <FaClock size={30} style={{ color: 'var(--accent-warning)' }} />
                <div style={{ textAlign: 'center' }}>
                  <strong style={{ display: 'block', fontSize: '16px', marginBottom: '4px', color: 'var(--accent-warning)' }}>Driver Pending</strong>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Awaiting admin approval</span>
                </div>
              </div>
            ) : null}
          </div>
        </motion.div>
      </motion.div>

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
