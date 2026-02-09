import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { getProfile } from "../../lib/getProfile";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    /* 1️⃣ Get email using username */
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email")
      .eq("username", username)
      .single();

    if (profileError || !profile) {
      setLoading(false);
      setError("Invalid username or password");
      return;
    }

    /* 2️⃣ Login using email + password */
    const { error: loginError } =
      await supabase.auth.signInWithPassword({
        email: profile.email,
        password,
      });

    if (loginError) {
      setLoading(false);
      setError("Invalid username or password");
      return;
    }

    /* 3️⃣ Fetch full profile */
    const fullProfile = await getProfile();

    if (!fullProfile) {
      setLoading(false);
      setError("Unable to fetch user profile");
      return;
    }

    /* 4️⃣ Save role for route protection */
    localStorage.setItem("role", fullProfile.role);

    setLoading(false);

    /* 5️⃣ Navigate based on role */
    if (fullProfile.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/customer");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Login</h2>

        <form onSubmit={handleLogin}>
          <input
            className="auth-input"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <div className="password-wrapper">
            <input
              className="auth-input"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* 👁 Eye toggle */}
            <span
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              style={{ cursor: "pointer" }}
            >
              👁
            </span>
          </div>

          {error && <p style={{ color: "red" }}>{error}</p>}

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p>
          Don’t have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}