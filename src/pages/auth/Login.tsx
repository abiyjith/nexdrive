import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../../styles/auth.css";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // 1️⃣ get email + role from username
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, role")
      .eq("username", username)
      .single();

    if (profileError || !profile) {
      setError("Invalid username or password");
      setLoading(false);
      return;
    }

    // 2️⃣ authenticate
    const { data, error: authError } =
      await supabase.auth.signInWithPassword({
        email: profile.email,
        password,
      });

    if (authError || !data.user) {
      setError("Invalid username or password");
      setLoading(false);
      return;
    }

    // 3️⃣ store role
localStorage.setItem("active_role", profile.role);
    // 4️⃣ HARD redirect (no customer default)
    if (profile.role === "owner") {
      navigate("/owner/dashboard", { replace: true });
    } else if (profile.role === "admin") {
      navigate("/admin", { replace: true });
    } else {
      navigate("/customer/home", { replace: true });
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">P2P Rentals</h2>

        {error && <p className="auth-error">{error}</p>}

        <form onSubmit={handleLogin}>
          <div className="auth-field">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="auth-field password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button className="auth-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-footer">
          Don’t have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}