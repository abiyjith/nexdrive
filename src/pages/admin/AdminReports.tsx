import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useNavigate } from "react-router-dom";
import { FaFlag, FaArrowLeft, FaRegClock, FaCheckCircle, FaExclamationTriangle, FaSearch } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import "../../styles/admin.css";
import "../../styles/app.css";

export default function AdminReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "reports"));
      const data: any[] = [];

      for (const d of snap.docs) {
        const reportData = d.data();
        let reportedBy = "Unknown";
        let reportedUser = "Unknown";

        // Try to fetch reporter name if reporter_id exists
        if (reportData.reporter_id) {
          try {
            const userSnap = await getDoc(doc(db, "users", reportData.reporter_id));
            if (userSnap.exists()) {
              reportedBy = userSnap.data().first_name + " " + (userSnap.data().last_name || "");
            }
          } catch (e) {
            console.error("Error fetching reporter:", e);
          }
        }

        // Add booking details or other context if needed here
        
        data.push({ 
          id: d.id, 
          ...reportData,
          reportedBy,
          reportedUser
        });
      }

      // Sort by status pending first
      data.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return 0;
      });

      setReports(data);
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'resolved': return 'var(--accent-success)';
      case 'investigating': return 'var(--accent-primary)';
      case 'dismissed': return 'var(--text-muted)';
      case 'pending': default: return 'var(--accent-danger)';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'resolved': return <FaCheckCircle color="var(--accent-success)" />;
      case 'investigating': return <FaRegClock color="var(--accent-primary)" />;
      case 'pending': default: return <FaExclamationTriangle color="var(--accent-danger)" />;
    }
  };

  const filteredReports = reports.filter(r => 
    (r.reason || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.booking_id || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.status || "").toLowerCase().includes(search.toLowerCase())
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
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 30px', marginBottom: '40px', borderLeft: '4px solid var(--accent-danger)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-danger)', padding: '15px', borderRadius: '12px' }}>
            <FaFlag size={32} />
          </div>
          <div>
            <h2 style={{ margin: '0 0 5px 0', fontSize: '28px' }}>User Reports</h2>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Monitor and resolve platform issues and user complaints</p>
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
              <h3 style={{ fontSize: '22px', margin: '0 0 5px 0', color: '#fff' }}>Open Reports</h3>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>Review and resolve issues raised by users</p>
            </div>
            
            <div style={{ position: 'relative', width: '300px', maxWidth: '100%' }}>
              <FaSearch style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search issues, bookings..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input"
                style={{ width: '100%', paddingLeft: '45px', background: 'var(--bg-glass)' }}
              />
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', margin: '60px 0' }}>
              <div className="spinner" style={{ fontSize: '30px', color: 'var(--accent-danger)', marginBottom: '15px' }} />
              <p style={{ color: 'var(--text-muted)' }}>Loading reports...</p>
            </div>
          ) : (
            <motion.div 
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <AnimatePresence>
                {filteredReports.map(r => (
                  <motion.div key={r.id} variants={cardVariants} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                    
                    {/* Status Ribbon */}
                    <div style={{ 
                      position: 'absolute', top: '15px', right: '-35px', background: r.status === 'resolved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: getStatusColor(r.status), 
                      padding: '5px 40px', transform: 'rotate(45deg)', fontSize: '11px', fontWeight: 'bold', zIndex: 10,
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textTransform: 'uppercase', border: `1px solid ${getStatusColor(r.status)}`
                    }}>
                      {r.status || 'Pending'}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', marginBottom: '20px', paddingRight: '40px' }}>
                      <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {getStatusIcon(r.status)}
                      </div>
                      <div>
                        <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          Report #{r.id.slice(0, 6)}
                        </h3>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px' }}>
                          From: {r.reportedBy || 'User'}
                        </p>
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-dark)', padding: '15px', borderRadius: '12px', marginBottom: '20px', borderLeft: `3px solid ${getStatusColor(r.status)}` }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '5px', textTransform: 'uppercase' }}>Issue Details</span>
                      <p style={{ margin: 0, color: '#fff', fontSize: '14px', lineHeight: '1.5' }}>
                        {r.reason || "No reason provided."}
                      </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid var(--border-color)' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Related Booking</span>
                        <strong style={{ fontSize: '13px', color: '#fff', fontFamily: 'monospace' }}>{r.booking_id || "N/A"}</strong>
                      </div>
                      <button
                        className="btn-ghost"
                        style={{ padding: '8px 15px', fontSize: '13px', color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)' }}
                        onClick={() => navigate(`/admin`)}
                      >
                        Action
                      </button>
                    </div>

                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {!loading && filteredReports.length === 0 && (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', marginTop: '20px' }}>
              <FaFlag size={60} style={{ color: 'var(--text-muted)', marginBottom: '20px' }} />
              <h3 style={{ margin: '0 0 10px 0' }}>No reports found</h3>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>All user issues have been resolved.</p>
            </div>
          )}

        </section>
      </div>
    </div>
  );
}
