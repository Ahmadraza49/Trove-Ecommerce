import { useEffect, useState } from "react";
import api from "../api/axios";

// SDD 6.2 Admin Dashboard: user management, product monitoring, system analytics
const STAT_LABELS = {
  totalUsers: "Total Users",
  totalProducts: "Total Products",
  totalOrders: "Total Orders",
  totalRevenue: "Revenue (Rs.)",
};

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get("/admin/analytics").then((res) => setAnalytics(res.data));
    api.get("/admin/users").then((res) => setUsers(res.data));
  }, []);

  const changeRole = async (id, role) => {
    await api.put(`/admin/users/${id}`, { role });
    const res = await api.get("/admin/users");
    setUsers(res.data);
  };

  return (
    <div className="container">
      <div className="section-title">
        <h2>Admin Dashboard</h2>
        <span>System overview</span>
      </div>

      {analytics && (
        <div className="product-grid" style={{ marginBottom: 32, gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
          {Object.entries(STAT_LABELS).map(([key, label]) => (
            <div key={key} className="card">
              <p style={{ fontSize: 12.5, color: "var(--color-ink-soft)", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                {label}
              </p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 24, fontWeight: 600, color: "var(--color-primary)", margin: 0 }}>
                {key === "totalRevenue" ? analytics[key]?.toLocaleString() : analytics[key]}
              </p>
            </div>
          ))}
        </div>
      )}

      <h3 style={{ fontSize: 16, marginBottom: 12 }}>User Management</h3>
      {users.map((u) => (
        <div
          key={u._id}
          className="card"
          style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <div>
            <strong style={{ fontFamily: "var(--font-display)" }}>{u.name}</strong>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-ink-soft)" }}>{u.email}</p>
          </div>
          <select value={u.role} onChange={(e) => changeRole(u._id, e.target.value)} style={{ width: 140 }}>
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;
