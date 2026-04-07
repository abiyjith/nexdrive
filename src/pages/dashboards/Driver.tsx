import { useEffect, useState } from "react";
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import { switchRole } from "../../lib/roleHelpers";
import Toast from "../../components/Toast";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserTie, FaUser, FaCar, FaCheckCircle, FaCalendarPlus, FaRupeeSign, FaBan, FaCalendarTimes, FaExchangeAlt, FaShieldAlt } from "react-icons/fa";
import "../../styles/app.css";

export default function DriverDashboard() {
  const { user, userData } = useAuth();

  const [startDateStr, setStartDateStr] = useState("");
  const [endDateStr, setEndDateStr] = useState("");
  const [dates, setDates] = useState<any[]>([]);
  const [price, setPrice] = useState("");
  const [priceSaved, setPriceSaved] = useState(false);
  const [toast, setToast] = useState<any>(null);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  useEffect(() => {
    loadDates();
    loadPrice();
  }, [user]);

  /* LOAD DRIVER PRICE */
  const loadPrice = async () => {
    if (!user) return;
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) {
      const data = snap.data();
      if (data.driver_price_per_day) {
        setPrice(data.driver_price_per_day);
        setPriceSaved(true);
      }
    }
  };

  /* UPDATE DRIVER PRICE */
  const updateDriverPrice = async () => {
    if (!user) return;
    if (!price || Number(price) <= 0) {
      setToast({ type: "error", message: "Please enter a valid price." });
      return;
    }

    await updateDoc(doc(db, "users", user.uid), {
      driver_price_per_day: Number(price)
    });

    setPriceSaved(true);
    setToast({ type: "success", message: "Driver price updated successfully." });
  };

  /* LOAD DRIVER AVAILABILITY */
  const loadDates = async () => {
    if (!user) return;

    const q = query(
      collection(db, "driver_availability"),
      where("driver_id", "==", user.uid)
    );

    const snap = await getDocs(q);

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const currentDate = `${yyyy}-${mm}-${dd}`;

    const validDates: any[] = [];

    for (const d of snap.docs) {
      const data = d.data();
      if (data.date < currentDate) {
        await deleteDoc(doc(db, "driver_availability", d.id));
      } else {
        validDates.push({ id: d.id, ...data });
      }
    }

    setDates(validDates.sort((a,b) => a.date.localeCompare(b.date)));
  };

  /* ADD DATES RANGE */
  const addDateRange = async () => {
    /* CHECK DRIVER PRICE FIRST */
    if (!priceSaved) {
      setToast({ type: "warning", message: "Set your daily price first before adding availability." });
      return;
    }

    if (!startDateStr || !endDateStr || startDateStr > endDateStr) {
      setToast({ type: "warning", message: "Please select a valid date range." });
      return;
    }

    setToast({ type: "info", message: "Adding dates..." });

    let current = new Date(startDateStr);
    current.setHours(0,0,0,0);
    const endMidnight = new Date(endDateStr);
    endMidnight.setHours(0,0,0,0);

    let addedCount = 0;

    while (current <= endMidnight) {
      const dStr = current.toISOString().split("T")[0];

      const q = query(
        collection(db, "driver_availability"),
        where("driver_id", "==", user?.uid),
        where("date", "==", dStr)
      );

      const snap = await getDocs(q);

      if (snap.empty) {
        await addDoc(collection(db, "driver_availability"), {
          driver_id: user?.uid,
          date: dStr
        });
        addedCount++;
      }

      current.setDate(current.getDate() + 1);
    }

    setStartDateStr("");
    setEndDateStr("");
    
    if (addedCount > 0) {
      setToast({ type: "success", message: `Added ${addedCount} dates to your availability.` });
      loadDates();
    } else {
      setToast({ type: "warning", message: "Those dates are already marked as available." });
    }
  };

  /* DELETE DATE */
  const deleteDate = async (id: string) => {
    await deleteDoc(doc(db, "driver_availability", id));
    setToast({ type: "info", message: "Date removed from availability." });
    loadDates();
  };

  /* REQUEST OWNER ROLE */
  const requestOwnerRole = async () => {
    await addDoc(collection(db, "role_requests"), {
      user_id: user?.uid,
      requested_role: "owner",
      status: "pending"
    });
    setToast({ type: "success", message: "Owner role request sent to admin." });
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
          Driver Dashboard
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your availability, pricing, and active session.</p>
      </motion.div>

      <motion.div 
        className="modern-grid"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* CURRENT ROLE CARD */}
        <motion.div variants={itemVariants} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <FaUserTie size={36} style={{ color: 'var(--accent-success)' }} />
          </div>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>Professional Driver</h3>
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

            {/* Owner Switch/Request */}
            {userData?.is_owner ? (
              <button 
                className="btn-ghost"
                style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', border: '1px solid var(--border-color)', height: '100%' }}
                onClick={() => handleRoleSwitch("owner")}
                disabled={loadingRole === "owner"}
              >
                <FaCar size={30} style={{ color: 'var(--accent-primary)' }} />
                <div>
                  <strong style={{ display: 'block', fontSize: '16px', marginBottom: '4px' }}>Vehicle Owner</strong>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Manage your fleet</span>
                </div>
                {loadingRole === "owner" && <span className="spinner" style={{ marginTop: '10px' }}></span>}
              </button>
            ) : (
              <button 
                className="btn-ghost"
                style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', border: '1px dashed rgba(59, 130, 246, 0.4)', background: 'rgba(59, 130, 246, 0.05)', height: '100%' }}
                onClick={requestOwnerRole}
              >
                <FaShieldAlt size={30} style={{ color: 'var(--accent-primary)' }} />
                <div>
                  <strong style={{ display: 'block', fontSize: '16px', marginBottom: '4px', color: 'var(--accent-primary)' }}>Become an Owner</strong>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>List your vehicles</span>
                </div>
              </button>
            )}
          </div>
        </motion.div>

        {/* PRICING & AVAILABILITY SECTION */}
        <motion.div variants={itemVariants} className="glass-panel" style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', padding: 0, overflow: 'hidden' }}>
          
          {/* PRICING */}
          <div style={{ padding: '30px', background: 'rgba(16, 185, 129, 0.05)', borderRight: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
              <div style={{ background: 'var(--bg-glass)', padding: '12px', borderRadius: '12px', color: 'var(--accent-success)' }}>
                <FaRupeeSign size={24} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '20px' }}>Daily Rate</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>Set your hiring price</p>
              </div>
            </div>

            <div className="input-group">
              <input
                type="number"
                className="input-field"
                placeholder="Enter price per day (₹)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                style={{ fontSize: '18px', padding: '16px' }}
              />
            </div>
            
            <button className="btn-primary" style={{ width: '100%', marginTop: '15px', background: priceSaved ? 'var(--bg-card)' : '', color: priceSaved ? 'var(--text-primary)' : '', border: priceSaved ? '1px solid var(--border-color)' : '' }} onClick={updateDriverPrice}>
              {priceSaved ? <><FaCheckCircle/> Rate Saved</> : "Update Price"}
            </button>
          </div>

          {/* ADD AVAILABILITY */}
          <div style={{ padding: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
              <div style={{ background: 'var(--bg-glass)', padding: '12px', borderRadius: '12px', color: 'var(--accent-primary)' }}>
                <FaCalendarPlus size={24} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '20px' }}>Add Available Dates</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>Let customers know when you're free</p>
              </div>
            </div>

            <div className="input-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>From</label>
                <input
                  type="date"
                  className="input-field"
                  min={new Date().toISOString().split("T")[0]}
                  value={startDateStr}
                  onChange={(e) => setStartDateStr(e.target.value)}
                  style={{ width: '100%', padding: '10px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>To</label>
                <input
                  type="date"
                  className="input-field"
                  min={startDateStr || new Date().toISOString().split("T")[0]}
                  value={endDateStr}
                  onChange={(e) => setEndDateStr(e.target.value)}
                  style={{ width: '100%', padding: '10px' }}
                />
              </div>
            </div>
            
            <button className="btn-primary" onClick={addDateRange} style={{ width: '100%', marginTop: '10px' }}>
              Add Available Dates
            </button>

            {/* DATES LIST */}
            <div style={{ marginTop: '25px', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto', paddingRight: '5px' }}>
              <AnimatePresence>
                {dates.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>
                    <FaCalendarTimes size={30} style={{ opacity: 0.2, marginBottom: '10px' }} />
                    <div>No availability set. Add dates to get hired!</div>
                  </motion.div>
                ) : (
                  dates.map(d => (
                    <motion.div 
                      key={d.id} 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      exit={{ opacity: 0, scale: 0.9 }}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' }}>
                        <FaCheckCircle style={{ color: 'var(--accent-success)' }}/>
                        {new Date(d.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <button 
                        onClick={() => deleteDate(d.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px' }}
                        title="Remove Date"
                      >
                        <FaBan size={16} />
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
            
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
