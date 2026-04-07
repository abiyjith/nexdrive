import { useState, useRef } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import Toast from "./Toast";
import { motion } from "framer-motion";
import { FaTimes, FaSpinner, FaCar, FaRupeeSign, FaImage, FaTrash } from "react-icons/fa";

export default function EditVehicleModal({ vehicle, onClose, onUpdate }: { vehicle: any, onClose: () => void, onUpdate: () => void }) {
  const { user } = useAuth();
  
  const [brand, setBrand] = useState(vehicle.brand || "");
  const [model, setModel] = useState(vehicle.model || "");
  const [year, setYear] = useState(vehicle.year || "");
  const [fuel, setFuel] = useState(vehicle.fuel || "");
  const [price, setPrice] = useState(vehicle.price_per_day || "");
  const [freeKm, setFreeKm] = useState(vehicle.free_km_per_day || "");
  const [extraPrice, setExtraPrice] = useState(vehicle.extra_price_per_km || "");
  
  // Existing images logic (fallback to single vehicle_image if images array doesn't exist)
  const initialImages = vehicle.images && vehicle.images.length > 0 
    ? vehicle.images 
    : (vehicle.vehicle_image ? [vehicle.vehicle_image] : []);
    
  const [existingImages, setExistingImages] = useState<string[]>(initialImages);
  const [newImages, setNewImages] = useState<File[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<any>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const removeExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };
  
  const removeNewImage = (index: number) => {
    setNewImages(newImages.filter((_, i) => i !== index));
  };

  const saveChanges = async () => {
    if (!brand || !model || !price) {
      setToast({ type: "warning", message: "Brand, Model, and Price are required." });
      return;
    }
    
    if (existingImages.length === 0 && newImages.length === 0) {
      setToast({ type: "warning", message: "You must have at least one vehicle image." });
      return;
    }

    try {
      setLoading(true);

      /* UPLOAD NEW IMAGES */
      const uploadedImageURLs: string[] = [];
      for (let i = 0; i < newImages.length; i++) {
        const imageRef = ref(storage, `vehicle_images/${user!.uid}_${Date.now()}_${i}`);
        await uploadBytes(imageRef, newImages[i]);
        const url = await getDownloadURL(imageRef);
        uploadedImageURLs.push(url);
      }
      
      const finalImages = [...existingImages, ...uploadedImageURLs];
      const primaryImageURL = finalImages[0];

      /* UPDATE VEHICLE */
      await updateDoc(doc(db, "vehicles", vehicle.id), {
        brand,
        model,
        year,
        fuel,
        price_per_day: Number(price),
        free_km_per_day: Number(freeKm),
        extra_price_per_km: Number(extraPrice),
        vehicle_image: primaryImageURL, /* update cover image */
        images: finalImages, /* update array */
      });

      setToast({ type: "success", message: "Vehicle updated successfully!" });
      setTimeout(() => {
        onUpdate();
        onClose();
      }, 1500);

    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: "Error saving changes." });
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-panel"
        style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '30px', position: 'relative' }}
      >
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-main)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
        >
          <FaTimes />
        </button>

        <h2 style={{ margin: '0 0 25px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
          Edit {vehicle.brand} {vehicle.model}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div className="input-group">
            <label><FaCar /> Brand</label>
            <input className="input-field" value={brand} onChange={e => setBrand(e.target.value)} disabled={loading} />
          </div>
          <div className="input-group">
            <label><FaCar /> Model</label>
            <input className="input-field" value={model} onChange={e => setModel(e.target.value)} disabled={loading} />
          </div>
          <div className="input-group">
            <label>Year</label>
            <input type="number" className="input-field" value={year} onChange={e => setYear(e.target.value)} disabled={loading} />
          </div>
          <div className="input-group">
            <label>Fuel Type</label>
            <select className="input-field" value={fuel} onChange={e => setFuel(e.target.value)} disabled={loading}>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="EV">Electric (EV)</option>
              <option value="CNG">CNG</option>
            </select>
          </div>
        </div>

        <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>Pricing Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div className="input-group">
            <label><FaRupeeSign /> Price Per Day</label>
            <input type="number" className="input-field" value={price} onChange={e => setPrice(e.target.value)} disabled={loading} />
          </div>
          <div className="input-group">
            <label>Free KM / Day</label>
            <input type="number" className="input-field" value={freeKm} onChange={e => setFreeKm(e.target.value)} disabled={loading} />
          </div>
          <div className="input-group">
            <label>Extra Price / KM</label>
            <input type="number" className="input-field" value={extraPrice} onChange={e => setExtraPrice(e.target.value)} disabled={loading} />
          </div>
        </div>

        <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>Manage Images</h3>
        
        {/* EXISTING IMAGES */}
        {existingImages.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '10px' }}>Current Images</p>
            <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
              {existingImages.map((img, i) => (
                <div key={i} style={{ position: 'relative', minWidth: '150px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  <img src={img} alt={`Vehicle ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={() => removeExistingImage(i)} style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', width: '24px', height: '24px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaTrash size={10} />
                  </button>
                  {i === 0 && <span style={{ position: 'absolute', bottom: '5px', left: '5px', background: 'var(--accent-primary)', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>Cover</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* UPLOAD NEW IMAGES */}
        <div style={{ marginBottom: '30px' }}>
          <div 
            style={{ border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '20px', textAlign: 'center', cursor: 'pointer', background: 'var(--bg-dark)' }}
            onClick={() => !loading && imageInputRef.current?.click()}
          >
            <input type="file" accept="image/*" multiple style={{ display: 'none' }} ref={imageInputRef} onChange={(e) => setNewImages([...newImages, ...Array.from(e.target.files || [])])} disabled={loading} />
            <FaImage size={24} style={{ color: 'var(--text-muted)', marginBottom: '10px' }} />
            <div style={{ fontSize: '14px', color: 'var(--text-main)' }}>Add more photos</div>
          </div>

          {newImages.length > 0 && (
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginTop: '15px', paddingBottom: '5px' }}>
              {newImages.map((file, i) => (
                <div key={i} style={{ position: 'relative', minWidth: '100px', height: '70px', borderRadius: '6px', overflow: 'hidden', border: '2px solid var(--accent-success)' }}>
                  <img src={URL.createObjectURL(file)} alt={`New ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={() => removeNewImage(i)} style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', width: '20px', height: '20px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaTimes size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button 
          className="btn-primary" 
          style={{ width: '100%', padding: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '16px' }}
          onClick={saveChanges}
          disabled={loading}
        >
          {loading ? <><FaSpinner className="spinner" /> Saving Updates...</> : "Save Changes"}
        </button>

      </motion.div>
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
