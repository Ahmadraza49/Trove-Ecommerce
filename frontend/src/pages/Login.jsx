import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h2>Welcome back</h2>
        <p className="subtitle">Log in to continue to Trove.</p>
        {error && <p className="error-text">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label className="field-label">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <label className="field-label">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button className="btn" type="submit" style={{ width: "100%", marginTop: 18 }}>
            Log In
          </button>
        </form>
        <p className="helper-link">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
