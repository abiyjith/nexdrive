import { useState, useRef } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import MapPicker from "../../components/MapPicker";
import Toast from "../../components/Toast";
import { motion } from "framer-motion";
import { FaCar, FaIdCard, FaGasPump, FaCalendarAlt, FaRupeeSign, FaImage, FaFilePdf, FaMapMarkerAlt, FaUpload, FaSpinner, FaCheckCircle } from "react-icons/fa";
import "../../styles/owner.css";
import "../../styles/app.css";

export default function AddVehicle() {
  const { user } = useAuth();

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [fuel, setFuel] = useState("");
  const [year, setYear] = useState("");
  const [price, setPrice] = useState("");
  const [freeKm, setFreeKm] = useState("");
  const [extraPrice, setExtraPrice] = useState("");
  const [location, setLocation] = useState<any>(null);

  const [vehicleImages, setVehicleImages] = useState<File[]>([]);
  const [rcFile, setRcFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<any>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const rcInputRef = useRef<HTMLInputElement>(null);

  const addVehicle = async () => {
    if (!brand || !model || !vehicleNumber || !price || !fuel || !year) {
      setToast({ type: "warning", message: "Please fill in all basic vehicle details." });
      return;
    }
    if (!freeKm || !extraPrice) {
      setToast({ type: "warning", message: "Please enter Free KM limit and Extra Price per KM." });
      return;
    }
    if (vehicleImages.length === 0 || !rcFile) {
      setToast({ type: "warning", message: "At least one Vehicle Image and RC Document are required." });
      return;
    }
    if (!location) {
      setToast({ type: "warning", message: "Please pinpoint the vehicle location on the map." });
      return;
    }

    try {
      setLoading(true);

      /* UPLOAD MULTIPLE IMAGES */
      const uploadedImageURLs: string[] = [];
      for (let i = 0; i < vehicleImages.length; i++) {
        const imageRef = ref(storage, `vehicle_images/${user!.uid}_${Date.now()}_${i}`);
        await uploadBytes(imageRef, vehicleImages[i]);
        const url = await getDownloadURL(imageRef);
        uploadedImageURLs.push(url);
      }
      const primaryImageURL = uploadedImageURLs[0];

      /* UPLOAD RC */
      const rcRef = ref(storage, `vehicle_rc/${user!.uid}_${Date.now()}`);
      await uploadBytes(rcRef, rcFile);
      const rcURL = await getDownloadURL(rcRef);

      /* SAVE VEHICLE */
      await addDoc(collection(db, "vehicles"), {
        owner_id: user!.uid,
        brand,
        model,
        vehicle_number: vehicleNumber,
        fuel,
        year,
        price_per_day: Number(price),
        free_km_per_day: Number(freeKm),
        extra_price_per_km: Number(extraPrice),
        location,
        vehicle_image: primaryImageURL, /* primary/cover image for backwards compatibility */
        images: uploadedImageURLs, /* stores all uploaded images sequentially */
        vehicle_rc: rcURL,
        status: "pending",
        admin_message: "",
        is_available: false,
        created_at: serverTimestamp()
      });

      setToast({ type: "success", message: "Vehicle submitted successfully! Awaiting admin approval." });

      // Reset form
      setBrand("");
      setModel("");
      setVehicleNumber("");
      setFuel("");
      setYear("");
      setPrice("");
      setFreeKm("");
      setExtraPrice("");
      setLocation(null);
      setVehicleImages([]);
      setRcFile(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
      if (rcInputRef.current) rcInputRef.current.value = "";

    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: "Error submitting vehicle. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '40px', textAlign: 'center' }}
      >
        <h1 className="gradient-text" style={{ fontSize: '36px', marginBottom: '8px' }}>
          List Your Vehicle
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Provide details to register your commercial vehicle with NexDrive.</p>
      </motion.div>

      <motion.div 
        className="glass-panel"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        style={{ padding: '40px' }}
      >
        
        <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaCar style={{ color: 'var(--accent-primary)' }}/> Basic Information
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <div className="input-group">
            <label><FaCar /> Brand / Make</label>
            <input className="input-field" placeholder="e.g., Toyota, Ford" value={brand} onChange={e => setBrand(e.target.value)} disabled={loading} />
          </div>
          
          <div className="input-group">
            <label><FaCar /> Model</label>
            <input className="input-field" placeholder="e.g., Innova Crysta, Transit" value={model} onChange={e => setModel(e.target.value)} disabled={loading} />
          </div>

          <div className="input-group">
            <label><FaIdCard /> Registration Number</label>
            <input className="input-field" placeholder="e.g., KL 01 AB 1234" value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value)} disabled={loading} />
          </div>

          <div className="input-group">
            <label><FaGasPump /> Fuel Type</label>
            <select className="input-field" value={fuel} onChange={e => setFuel(e.target.value)} disabled={loading}>
              <option value="" disabled>Select Fuel Type</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="EV">Electric (EV)</option>
              <option value="CNG">CNG</option>
            </select>
          </div>

          <div className="input-group">
            <label><FaCalendarAlt /> Manufacture Year</label>
            <input type="number" className="input-field" placeholder="e.g., 2021" value={year} onChange={e => setYear(e.target.value)} disabled={loading} />
          </div>
        </div>


        <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaRupeeSign style={{ color: 'var(--accent-success)' }}/> Pricing & Limits
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <div className="input-group">
            <label>Price Per Day (₹)</label>
            <input type="number" className="input-field" placeholder="e.g., 2500" value={price} onChange={e => setPrice(e.target.value)} disabled={loading} />
          </div>
          
          <div className="input-group">
            <label>Free KM Per Day limit</label>
            <input type="number" className="input-field" placeholder="e.g., 200" value={freeKm} onChange={e => setFreeKm(e.target.value)} disabled={loading} />
          </div>

          <div className="input-group">
            <label>Extra Price Per KM (₹)</label>
            <input type="number" className="input-field" placeholder="e.g., 12" value={extraPrice} onChange={e => setExtraPrice(e.target.value)} disabled={loading} />
          </div>
        </div>


        <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaMapMarkerAlt style={{ color: 'var(--accent-danger)' }}/> Pickup Location
        </h3>
        
        <div style={{ marginBottom: '40px' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '15px' }}>
            Pinpoint the exact location where the customer should pick up this vehicle.
          </p>
          <div style={{ height: '300px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            <MapPicker setLocation={setLocation} />
          </div>
          {location && (
            <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaCheckCircle /> Location selected successfully
            </div>
          )}
        </div>


        <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaUpload style={{ color: 'var(--accent-warning)' }}/> Documents & Images
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          
          {/* VEHICLE IMAGE UPLOAD (MULTIPLE) */}
          <div 
            style={{ 
              border: `2px dashed ${vehicleImages.length > 0 ? 'var(--accent-success)' : 'var(--border-color)'}`, 
              borderRadius: '16px', padding: '30px', textAlign: 'center', 
              background: vehicleImages.length > 0 ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-dark)',
              cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease'
            }}
            onClick={() => !loading && imageInputRef.current?.click()}
          >
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              style={{ display: 'none' }} 
              ref={imageInputRef} 
              onChange={(e) => setVehicleImages(Array.from(e.target.files || []))} 
              disabled={loading} 
            />
            
            {vehicleImages.length > 0 ? (
              <div>
                <FaCheckCircle size={40} style={{ color: 'var(--accent-success)', marginBottom: '15px' }} />
                <h4 style={{ margin: '0 0 5px 0' }}>{vehicleImages.length} Images Selected</h4>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>Click to replace all selected images.</p>
              </div>
            ) : (
              <div>
                <FaImage size={40} style={{ color: 'var(--text-muted)', marginBottom: '15px' }} />
                <h4 style={{ margin: '0 0 5px 0' }}>Upload Vehicle Photos</h4>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>Select multiple images to show off the vehicle.</p>
              </div>
            )}
          </div>

          {/* RC UPLOAD */}
          <div 
            style={{ 
              border: `2px dashed ${rcFile ? 'var(--accent-success)' : 'var(--border-color)'}`, 
              borderRadius: '16px', padding: '30px', textAlign: 'center', 
              background: rcFile ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-dark)',
              cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease'
            }}
            onClick={() => !loading && rcInputRef.current?.click()}
          >
            <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} ref={rcInputRef} onChange={(e) => setRcFile(e.target.files?.[0] || null)} disabled={loading} />
            
            {rcFile ? (
              <div>
                <FaCheckCircle size={40} style={{ color: 'var(--accent-success)', marginBottom: '15px' }} />
                <h4 style={{ margin: '0 0 5px 0' }}>RC Document Selected</h4>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>{rcFile.name}</p>
              </div>
            ) : (
              <div>
                <FaFilePdf size={40} style={{ color: 'var(--text-muted)', marginBottom: '15px' }} />
                <h4 style={{ margin: '0 0 5px 0' }}>Upload RC Copy</h4>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>PDF or Image showing RC details</p>
              </div>
            )}
          </div>
          
        </div>

        <button 
          className="btn-primary" 
          style={{ width: '100%', padding: '16px', fontSize: '18px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
          onClick={addVehicle}
          disabled={loading}
        >
          {loading ? (
            <><FaSpinner className="spinner" /> Submitting to Admin...</>
          ) : (
            <><FaCar/> Submit Vehicle for Approval</>
          )}
        </button>

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
