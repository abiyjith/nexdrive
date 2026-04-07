import { useEffect, useState, useRef } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import Toast from "../../components/Toast";
import { motion } from "framer-motion";
import { FaUser, FaEnvelope, FaIdBadge, FaCamera, FaSpinner, FaCheckCircle, FaCar } from "react-icons/fa";
import "../../styles/profile.css";
import "../../styles/app.css";

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) {
      setProfile(snap.data());
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploading(true);
      const storageRef = ref(storage, `profiles/${user.uid}_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await updateDoc(doc(db, "users", user.uid), {
        photoURL: url
      });

      setProfile({ ...profile, photoURL: url });
      setToast({ type: "success", message: "Profile photo updated successfully!" });
    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: "Failed to upload photo. Please try again." });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!profile) return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="spinner" style={{ fontSize: '40px', color: 'var(--accent-primary)' }}><FaCar /></div>
    </div>
  );

  return (
    <div className="page-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '40px', textAlign: 'center' }}
      >
        <h1 className="gradient-text" style={{ fontSize: '36px', marginBottom: '8px' }}>
          Owner Profile
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your personal information and fleet identity.</p>
      </motion.div>

      <motion.div 
        className="glass-panel profile-container"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 25 }}
        style={{ padding: '0', overflow: 'hidden' }}
      >
        {/* Cover Banner */}
        <div style={{ height: '160px', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-success)', padding: '6px 16px', borderRadius: '100px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', backdropFilter: 'blur(4px)' }}>
            <FaCheckCircle /> Verified Owner
          </div>
        </div>

        <div style={{ padding: '0 40px 40px 40px', position: 'relative', marginTop: '-60px' }}>
          
          {/* Avatar Upload Section */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px' }}>
            <div className="avatar-wrapper" onClick={() => !uploading && fileInputRef.current?.click()}>
              <div className="profile-avatar-container">
                <img
                  src={profile.photoURL || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                  onError={(e) => { e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png" }}
                  className="profile-avatar"
                  alt="Profile Avatar"
                  style={{ opacity: uploading ? 0.5 : 1, transition: '0.3s', width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--bg-card)', background: 'var(--bg-dark)' }}
                />
              </div>
              <div className="avatar-overlay">
                {uploading ? <FaSpinner className="spinner" size={24} /> : <FaCamera size={24} />}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
              />
            </div>
            <h2 style={{ margin: '15px 0 5px 0', fontSize: '24px' }}>{profile.first_name} {profile.last_name}</h2>
            <p style={{ margin: 0, color: 'var(--accent-primary)', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>{profile.active_role}</p>
          </div>

          {/* User Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            
            <div className="detail-item glass-panel" style={{ padding: '20px', background: 'var(--bg-dark)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '10px', color: 'var(--accent-primary)' }}>
                  <FaUser size={20} />
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Full Name</span>
                  <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{profile.first_name} {profile.last_name}</div>
                </div>
              </div>
            </div>

            <div className="detail-item glass-panel" style={{ padding: '20px', background: 'var(--bg-dark)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '10px', color: 'var(--accent-primary)' }}>
                  <FaEnvelope size={20} />
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Email Address</span>
                  <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{profile.email}</div>
                </div>
              </div>
            </div>

            <div className="detail-item glass-panel" style={{ padding: '20px', background: 'var(--bg-dark)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '10px', color: 'var(--accent-primary)' }}>
                  <FaIdBadge size={20} />
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Username</span>
                  <div style={{ fontSize: '16px', fontWeight: 'bold' }}>@{profile.username}</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </motion.div>

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
