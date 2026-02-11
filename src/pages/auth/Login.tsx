import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import "../../styles/auth.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 1️⃣ Get email via secure RPC
    const { data: email, error: rpcError } = await supabase
      .rpc("get_email_by_username", { u: username });

    if (rpcError || !email) {
      setError("Invalid credentials");
      return;
    }

    // 2️⃣ Login using Auth (SOURCE OF TRUTH)
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Invalid credentials");
      return;
    }

    navigate("/");
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleLogin}>
        <h2 className="auth-title">Login</h2>

        <input
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />

        <div className="password-field">
          <input
            type={showPwd ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <span className="eye-icon" onClick={() => setShowPwd(!showPwd)}>
            {showPwd ? "🙈" : "👁️"}
          </span>
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button className="auth-btn">Login</button>

        <p className="auth-footer">
          Don’t have an account?{" "}
          <Link className="auth-link" to="/register">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}