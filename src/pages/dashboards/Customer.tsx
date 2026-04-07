import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { switchRole } from "../../lib/roleHelpers";
import RoleRequest from "../../components/RoleRequest";
import Toast from "../../components/Toast";
import { motion } from "framer-motion";
import { FaUserShield, FaCarAlt, FaExchangeAlt, FaIdBadge } from "react-icons/fa";
import "../../styles/app.css";

export default function CustomerDashboard() {
  const { user, userData } = useAuth();
  const [toast, setToast] = useState<string | null>(null);

  if (!userData) return null;

  /* SWITCH ROLE */
  const handleSwitchRole = async (role: string) => {
    try {
      await switchRole(user!.uid, role);
      setToast(`Switched to ${role} role successfully`);
      // Reload to ensure context updates perfectly
      setTimeout(() => window.location.reload(), 800);
    } catch {
      setToast("Role switch failed");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
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
        className="dashboard-header"
        style={{ marginBottom: '40px' }}
      >
        <h1 className="gradient-text" style={{ fontSize: '36px', marginBottom: '8px' }}>
          Welcome back, {userData.first_name}!
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>
          Manage your accounts and requested roles below.
        </p>
      </motion.div>

      <motion.div 
        className="modern-grid"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* CURRENT ROLE CARD */}
        <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
            <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: '#3b82f6' }}>
              <FaIdBadge size={24} />
            </div>
            <h3 style={{ margin: 0, fontSize: '20px' }}>Current Role</h3>
          </div>
          <p style={{ fontSize: '24px', fontWeight: 'bold', textTransform: 'capitalize', margin: '0 0 10px 0' }}>
            {userData.active_role}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
            This is your active view on the platform.
          </p>
        </motion.div>

        {/* DRIVER ROLE CARD */}
        <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
              <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: '#10b981' }}>
                <FaUserShield size={24} />
              </div>
              <h3 style={{ margin: 0, fontSize: '20px' }}>Driver Role</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '25px' }}>
              Offer driving services and earn money.
            </p>
          </div>

          <div>
            {!userData.is_driver && (
              <RoleRequest role="driver" />
            )}
            {userData.is_driver && (
              <button
                className="btn-primary"
                style={{ width: '100%' }}
                onClick={() => handleSwitchRole("driver")}
                disabled={userData.active_role === 'driver'}
              >
                <FaExchangeAlt /> {userData.active_role === 'driver' ? 'Active' : 'Switch to Driver'}
              </button>
            )}
          </div>
        </motion.div>

        {/* OWNER ROLE CARD */}
        <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
              <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', color: '#f59e0b' }}>
                <FaCarAlt size={24} />
              </div>
              <h3 style={{ margin: 0, fontSize: '20px' }}>Owner Role</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '25px' }}>
              List your vehicles for rent and generate passive income.
            </p>
          </div>

          <div>
            {!userData.is_owner && (
              <RoleRequest role="owner" />
            )}
            {userData.is_owner && (
              <button
                className="btn-primary"
                style={{ width: '100%', background: 'var(--accent-warning)' }}
                onClick={() => handleSwitchRole("owner")}
                disabled={userData.active_role === 'owner'}
              >
                <FaExchangeAlt /> {userData.active_role === 'owner' ? 'Active' : 'Switch to Owner'}
              </button>
            )}
          </div>
        </motion.div>

      </motion.div>

      {/* TOAST MESSAGE */}
      {toast && (
        <Toast
          message={toast}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
