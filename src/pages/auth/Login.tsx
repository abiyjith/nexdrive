import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowRight, FaSun, FaMoon } from "react-icons/fa";
import "../../styles/auth.css";

export default function Login() {
  const { login, resendVerification } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      nav("/");
    } catch(e:any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
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
        >
          <div className="auth-header">
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-subtitle">Sign in to continue to your account</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="auth-error-box"
            >
              {error}
            </motion.div>
          )}

          <div className="input-group">
            <input
              className={`auth-input ${error ? 'input-error' : ''}`}
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <FaEnvelope className="input-icon" style={{ pointerEvents: 'none' }} />
          </div>

          <div className="input-group">
            <input
              className={`auth-input ${error ? 'input-error' : ''}`}
              type={show ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="input-icon" onClick={() => setShow(!show)}>
              {show ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>

          <motion.button 
            className="auth-btn"
            onClick={submit}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? "Signing in..." : (
              <>Sign In <FaArrowRight style={{ fontSize: '12px', marginLeft: '4px' }} /></>
            )}
          </motion.button>

          <button
            className="resend-btn"
            onClick={async () => {
              try{
                await resendVerification(email, password)
                alert("Verification email sent again.")
              } catch(e:any){
                setError(e.message)
              }
            }}
          >
            Resend Verification Email
          </button>

          <div className="auth-footer">
            Don't have an account? 
            <Link to="/register" className="auth-link">Create Account</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
