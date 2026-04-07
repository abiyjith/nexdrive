import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserPlus, FaSun, FaMoon } from "react-icons/fa";
import "../../styles/auth.css";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: ""
  });

  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const validate = (name: string, value: string) => {
    let newErrors: any = { ...errors };

    switch (name) {
      case "first_name":
        if (!value.trim()) newErrors.first_name = "First name required";
        else delete newErrors.first_name;
        break;
      case "last_name":
        if (!value.trim()) newErrors.last_name = "Last name required";
        else delete newErrors.last_name;
        break;
      case "username":
        if (value.length < 3) newErrors.username = "Username must be 3+ characters";
        else delete newErrors.username;
        break;
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) newErrors.email = "Invalid email address";
        else delete newErrors.email;
        break;
      case "password":
        if (value.length < 6) newErrors.password = "Password must be at least 6 characters";
        else delete newErrors.password;
        break;
    }
    setErrors(newErrors);
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    validate(name, value);
  };

  const submit = async () => {
    // Validate all before submit
    const newErrors: any = {};
    if (!form.first_name.trim()) newErrors.first_name = "Required";
    if (!form.last_name.trim()) newErrors.last_name = "Required";
    if (form.username.length < 3) newErrors.username = "Too short";
    if (!form.email) newErrors.email = "Required";
    if (form.password.length < 6) newErrors.password = "Too short";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      await register(form.email, form.password, form);
      alert("Verification email sent. Please verify before logging in.");
      nav("/login");
    } catch (err: any) {
      let submitErrors: any = {};
      switch (err.code) {
        case "auth/email-already-in-use":
          submitErrors.email = "Email already registered";
          break;
        case "auth/invalid-email":
          submitErrors.email = "Invalid email address";
          break;
        case "auth/weak-password":
          submitErrors.password = "Password too weak";
          break;
        default:
          submitErrors.general = "Registration failed. Try again.";
      }
      setErrors(submitErrors);
    }
    setLoading(false);
  };

  return (
    <div className="auth-bg">
      <button 
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        style={{
          position: 'absolute', top: '20px', right: '20px', 
          background: 'var(--bg-glass)', border: '1px solid var(--border-color)', 
          color: 'var(--text-main)', padding: '12px', borderRadius: '50%',
          cursor: 'pointer', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
        title="Toggle Theme"
      >
        {theme === 'dark' ? <FaSun size={20} /> : <FaMoon size={20} />}
      </button>

      <div className="auth-wrapper">
        <motion.div 
          className="auth-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ maxWidth: '480px' }}
        >
          <div className="auth-header">
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-subtitle">Join us to access the platform</p>
          </div>

          {errors.general && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="auth-error-box"
            >
              {errors.general}
            </motion.div>
          )}

          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="input-group">
              <input
                name="first_name"
                className={`auth-input ${errors.first_name ? 'input-error' : ''}`}
                placeholder="First Name"
                value={form.first_name}
                onChange={handleChange}
              />
              <FaUser className="input-icon" style={{ pointerEvents: 'none' }} />
              {errors.first_name && <p className="field-error">{errors.first_name}</p>}
            </div>

            <div className="input-group">
              <input
                name="last_name"
                className={`auth-input ${errors.last_name ? 'input-error' : ''}`}
                placeholder="Last Name"
                value={form.last_name}
                onChange={handleChange}
              />
              <FaUser className="input-icon" style={{ pointerEvents: 'none' }} />
              {errors.last_name && <p className="field-error">{errors.last_name}</p>}
            </div>
          </div>

          <div className="input-group">
            <input
              name="username"
              className={`auth-input ${errors.username ? 'input-error' : ''}`}
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
            />
            <FaUser className="input-icon" style={{ pointerEvents: 'none' }} />
            {errors.username && <p className="field-error">{errors.username}</p>}
          </div>

          <div className="input-group">
            <input
              name="email"
              className={`auth-input ${errors.email ? 'input-error' : ''}`}
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
            />
            <FaEnvelope className="input-icon" style={{ pointerEvents: 'none' }} />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          <div className="input-group">
            <input
              name="password"
              className={`auth-input ${errors.password ? 'input-error' : ''}`}
              type={show ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
            />
            <div className="input-icon" onClick={() => setShow(!show)}>
              {show ? <FaEyeSlash /> : <FaEye />}
            </div>
            {errors.password && <p className="field-error">{errors.password}</p>}
          </div>

          <motion.button
            className="auth-btn"
            onClick={submit}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ marginTop: '15px' }}
          >
            {loading ? "Creating Account..." : (
               <>Register <FaUserPlus style={{ marginLeft: '6px' }} /></>
            )}
          </motion.button>

          <div className="auth-footer">
            Already have an account? 
            <Link to="/login" className="auth-link">Sign In</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
