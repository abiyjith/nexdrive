import { useEffect, useState } from "react";

import { collection, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useNavigate } from "react-router-dom";
import { FaUserShield, FaArrowLeft, FaCheck, FaTimes, FaIdCard, FaUserTie, FaCar, FaClock, FaEnvelope } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Toast from "../../components/Toast";
import "../../styles/admin.css";
import "../../styles/app.css";

export default function AdminRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<any>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "role_requests"));
      const list: any[] = [];

      for (const r of snap.docs) {
        const data = r.data();
        let userEmail = "Unknown User";
        let userName = "Unknown";

        if (data.user_id) {
          const userSnap = await getDoc(doc(db, "users", data.user_id));
          if (userSnap.exists()) {
            userEmail = userSnap.data().email;
            userName = userSnap.data().first_name + " " + (userSnap.data().last_name || "");
          }
        }

        list.push({
          id: r.id,
          ...data,
          userEmail,
          userName
        });
      }

      // Sort pending first, then by date (if exists)
      list.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return 0; // Would add date sorting here if created_at exists on role_requests
      });

      setRequests(list);
    } catch (err) {
      console.error("Error loading requests:", err);
      setToast({ type: "error", message: "Failed to load role requests." });
    } finally {
      setLoading(false);
    }
  };

  const approve = async (req: any) => {
    if (!window.confirm(`Are you sure you want to approve ${req.userName} for the ${req.role_requested} role?`)) return;

    try {
      await updateDoc(doc(db, "users", req.user_id), {
        [`is_${req.role_requested}`]: true
      });

      await updateDoc(doc(db, "role_requests", req.id), {
        status: "approved",
        processed_at: new Date()
      });

      setToast({ type: "success", message: "Role request approved successfully." });
      
      // Optimistic update
      setRequests(requests.map(r => r.id === req.id ? { ...r, status: 'approved' } : r));
    } catch (err) {
      console.error("Error approving request:", err);
      setToast({ type: "error", message: "Failed to approve request." });
    }
  };

  const reject = async (req: any) => {
    const reason = prompt(`Enter rejection reason for ${req.userName}'s ${req.role_requested} application:`);
    if (!reason) return;

    try {
      await updateDoc(doc(db, "role_requests", req.id), {
        status: "rejected",
        admin_message: reason,
        processed_at: new Date()
      });

      setToast({ type: "success", message: "Role request rejected." });
      
      // Optimistic update
      setRequests(requests.map(r => r.id === req.id ? { ...r, status: 'rejected', admin_message: reason } : r));
    } catch (err) {
      console.error("Error rejecting request:", err);
      setToast({ type: "error", message: "Failed to reject request." });
    }
  };

  const getRoleIcon = (role: string) => {
    if (role === 'driver') return <FaUserTie size={24} color="#3b82f6" />;
    if (role === 'owner') return <FaCar size={24} color="#f59e0b" />;
    return <FaUserShield size={24} color="var(--accent-primary)" />;
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'approved': return { bg: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', border: 'rgba(16, 185, 129, 0.3)' };
      case 'rejected': return { bg: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-danger)', border: 'rgba(239, 68, 68, 0.3)' };
      default: return { bg: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-warning)', border: 'rgba(245, 158, 11, 0.3)' };
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

  // Split requests
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  return (
    <div className="page-container" style={{ maxWidth: '1400px', margin: '0 auto', background: 'var(--bg-dark)', minHeight: '100vh', padding: '30px' }}>
      
      {/* HEADER SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel" 
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 30px', marginBottom: '40px', borderLeft: '4px solid var(--accent-warning)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-warning)', padding: '15px', borderRadius: '12px' }}>
            <FaUserShield size={32} />
          </div>
          <div>
            <h2 style={{ margin: '0 0 5px 0', fontSize: '28px' }}>Role Requests</h2>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Approve or reject Driver and Owner applications</p>
          </div>
        </div>
        <button className="btn-ghost" style={{ border: '1px solid var(--border-color)' }} onClick={() => navigate("/admin")}>
          <FaArrowLeft style={{ marginRight: '8px' }}/> Back to Dashboard
        </button>
      </motion.div>

      <div className="admin-content-wrapper" style={{ margin: 0 }}>
        
        {/* PENDING REQUESTS SECTION */}
        <section style={{ background: 'transparent', border: 'none', padding: 0, boxShadow: 'none', marginBottom: '50px' }}>
          
          <div style={{ marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '22px', margin: '0 0 5px 0', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-warning)', boxShadow: '0 0 10px var(--accent-warning)' }} />
                Action Required
              </h3>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>Pending applications waiting for your review</p>
            </div>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-warning)', padding: '5px 15px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' }}>
              {pendingRequests.length} Pending
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', margin: '40px 0' }}>
              <div className="spinner" style={{ fontSize: '30px', color: 'var(--accent-warning)', marginBottom: '15px' }} />
              <p style={{ color: 'var(--text-muted)' }}>Loading requests...</p>
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '50px 20px', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'var(--text-muted)' }}>
              <FaCheck size={50} style={{ color: 'var(--accent-success)', marginBottom: '15px', opacity: 0.5 }} />
              <h3 style={{ margin: '0 0 5px 0', color: 'var(--text-muted)' }}>All Caught Up!</h3>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px' }}>There are no pending role requests at this time.</p>
            </div>
          ) : (
            <motion.div 
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <AnimatePresence>
                {pendingRequests.map(req => (
                  <motion.div key={req.id} variants={cardVariants} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', borderTop: `4px solid ${req.role_requested === 'driver' ? '#3b82f6' : '#f59e0b'}` }}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'var(--bg-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {getRoleIcon(req.role_requested)}
                        </div>
                        <div>
                          <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#fff', textTransform: 'capitalize' }}>{req.role_requested} Application</h3>
                          <span style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--accent-warning)', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: '10px', width: 'fit-content' }}>
                            <FaClock size={10} /> Pending Review
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-dark)', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
                      <div style={{ marginBottom: '12px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Applicant Name</span>
                        <strong style={{ fontSize: '15px', color: '#fff' }}>{req.userName}</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>
                        <FaEnvelope /> <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{req.userEmail}</span>
                      </div>
                    </div>

                    {req.license_url && (
                      <a
                        href={req.license_url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-ghost"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '20px', borderRadius: '8px' }}
                      >
                        <FaIdCard size={18} /> View Verification Document
                      </a>
                    )}

                    <div style={{ display: 'flex', gap: '15px', marginTop: 'auto' }}>
                      <button
                        className="btn-primary"
                        style={{ flex: 1, padding: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', border: '1px solid rgba(16, 185, 129, 0.3)', boxShadow: 'none' }}
                        onClick={() => approve(req)}
                      >
                        <FaCheck /> Approve
                      </button>
                      <button
                        className="btn-ghost"
                        style={{ flex: 1, padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-danger)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                        onClick={() => reject(req)}
                      >
                        <FaTimes /> Reject
                      </button>
                    </div>

                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

        </section>

        {/* PROCESSED REQUESTS SECTION */}
        {processedRequests.length > 0 && (
          <section style={{ background: 'transparent', border: 'none', padding: 0, boxShadow: 'none' }}>
            <div style={{ marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '20px', margin: '0 0 5px 0', color: 'var(--text-muted)' }}>Processed Applications</h3>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px' }}>History of approved and rejected requests</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', opacity: 0.8 }}>
              {processedRequests.map(req => {
                const styles = getStatusStyle(req.status);
                return (
                  <div key={req.id} className="glass-panel" style={{ padding: '20px' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'capitalize', fontSize: '15px' }}>
                        {req.role_requested === 'driver' ? <FaUserTie color="#3b82f6" /> : <FaCar color="#f59e0b" />}
                        {req.role_requested}
                      </h4>
                      <span style={{ 
                        background: styles.bg, color: styles.color, border: `1px solid ${styles.border}`,
                        padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase'
                      }}>
                        {req.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                      <div><strong style={{ color: '#fff' }}>{req.userName}</strong></div>
                      <div>{req.userEmail}</div>
                      
                      {req.status === 'rejected' && req.admin_message && (
                        <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(239, 68, 68, 0.05)', borderLeft: '3px solid var(--accent-danger)', borderRadius: '0 6px 6px 0' }}>
                          <span style={{ display: 'block', fontSize: '10px', color: 'var(--accent-danger)', marginBottom: '2px', textTransform: 'uppercase' }}>Reason</span>
                          <span style={{ color: '#ccc' }}>{req.admin_message}</span>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </section>
        )}

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
