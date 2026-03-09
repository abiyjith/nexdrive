import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/auth.css";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    try {
      await login(email, password);
      nav("/");
    } catch {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card animate-scale">
        <h2 className="auth-title">Login</h2>

        {error && <p className="auth-error">{error}</p>}

        <div className="input-group">
  <input
    placeholder="Email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
</div>

        <div className="input-group">
          <input
            type={show ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span className="eye" onClick={() => setShow(!show)}>
            👁
          </span>
        </div>

        <button onClick={submit}>Login</button>

        <div className="auth-footer">
          Don’t have an account? <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  );
}