import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import "../../styles/auth.css";

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // username uniqueness check
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (existing) {
      setError("Username already exists");
      setLoading(false);
      return;
    }

    // ONLY auth signup
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    navigate("/login", { replace: true });
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleRegister}>
        <h2 className="auth-title">Register</h2>

        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
        <input placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value)} required />
        <input placeholder="Last name" value={lastName} onChange={e => setLastName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />

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

        <button className="auth-btn" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="auth-footer">
          Already have an account? <Link className="auth-link" to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}