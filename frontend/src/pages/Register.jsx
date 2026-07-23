import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "buyer" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(form.name, form.email, form.password, form.role);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h2>Create your account</h2>
        <p className="subtitle">Join Trove as a buyer or start selling.</p>
        {error && <p className="error-text">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label className="field-label">Full Name</label>
          <input
            placeholder="Ahmad Raza"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
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
            placeholder="At least 6 characters"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <label className="field-label">Account Type</label>
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="buyer">Buyer — I want to shop</option>
            <option value="seller">Seller — I want to sell products</option>
          </select>
          <button className="btn" type="submit" style={{ width: "100%", marginTop: 18 }}>
            Create Account
          </button>
        </form>
        <p className="helper-link">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
