import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/auth.css";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
  });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    try {
      await register(form.email, form.password, form);
      nav("/login");
    } catch {
      setError("Registration failed");
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card animate-scale">
        <h2 className="auth-title">Register</h2>

        {error && <p className="auth-error">{error}</p>}

       {["first_name", "last_name", "username", "email"].map((k) => (
  <div className="input-group" key={k}>
    <input
      placeholder={k.replace("_", " ")}
      value={(form as any)[k]}
      onChange={(e) =>
        setForm({ ...form, [k]: e.target.value })
      }
    />
  </div>
))}

        <div className="input-group">
          <input
            type={show ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />
          <span className="eye" onClick={() => setShow(!show)}>
            👁
          </span>
        </div>

        <button onClick={submit}>Register</button>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}