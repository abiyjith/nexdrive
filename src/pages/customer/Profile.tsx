import { useEffect, useState, useRef } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import Toast from "../../components/Toast";
import { motion } from "framer-motion";
import { FaCamera, FaUserTag, FaEnvelope, FaIdCard, FaSpinner } from "react-icons/fa";
import "../../styles/profile.css";
import "../../styles/app.css";

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!user) return;
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) {
      setProfile(snap.data());
    }
  };

  /* PROFILE PHOTO UPLOAD SEQUENCE */
  useEffect(() => {
    if (file) {
      handleUpload();
    }
  }, [file]);

  const handleUpload = async () => {
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setToast({ type: "error", message: "Please select a valid image file." });
      setFile(null);
      return;
    }

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
      setToast({ type: "error", message: "Photo upload failed. Please try again." });
    } finally {
      setUploading(false);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  /* LOADING STATE */
  if (!profile) return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <FaSpinner className="spinner" size={40} style={{ color: 'var(--accent-primary)' }} />
    </div>
  );

  return (
    <div className="page-container profile-page">
      <motion.div 
        className="profile-card"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <h2 className="gradient-text" style={{ fontSize: '28px', marginBottom: '30px' }}>Your Profile</h2>

        <div className="profile-avatar-container">
          <img
            src={profile.photoURL || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
            onError={(e) => { e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png" }}
            className="profile-avatar"
            alt="Profile Avatar"
            style={{ opacity: uploading ? 0.5 : 1, transition: '0.3s' }}
          />

          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            style={{ display: 'none' }}
            accept="image/*"
          />

          <div 
            className="profile-avatar-overlay"
            onClick={() => !uploading && fileInputRef.current?.click()}
            title="Update Photo"
          >
            {uploading ? <FaSpinner className="spinner" size={16} /> : <FaCamera size={16} />}
          </div>
        </div>

        {uploading && <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '-15px', marginBottom: '20px' }}>Uploading image...</p>}

        <div className="profile-info">
          <div className="profile-detail-row">
            <span className="profile-detail-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaIdCard /> Name
            </span>
            <span className="profile-detail-value">{profile.first_name} {profile.last_name}</span>
          </div>

          <div className="profile-detail-row">
            <span className="profile-detail-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaEnvelope /> Email
            </span>
            <span className="profile-detail-value">{profile.email}</span>
          </div>

          <div className="profile-detail-row">
            <span className="profile-detail-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaUserTag /> Username
            </span>
            <span className="profile-detail-value">@{profile.username}</span>
          </div>

          <div className="profile-detail-row">
            <span className="profile-detail-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaUserTag /> Active Role
            </span>
            <span className="profile-detail-value" style={{ 
              textTransform: 'capitalize', 
              color: 'var(--bg-dark)', 
              background: 'var(--accent-primary)',
              padding: '4px 10px',
              borderRadius: '100px',
              fontWeight: 700,
              fontSize: '12px'
            }}>
              {profile.active_role}
            </span>
          </div>
        </div>

        <p style={{ marginTop: '30px', color: 'var(--text-muted)', fontSize: '13px' }}>
          Registered since {profile.created_at ? new Date(profile.created_at.toDate()).toLocaleDateString() : 'Unknown'}
        </p>

      </motion.div>

      {/* TOAST */}
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
