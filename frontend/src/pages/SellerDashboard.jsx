import { useEffect, useState } from "react";
import api from "../api/axios";
import { CATEGORIES } from "../constants";
import { useAuth } from "../context/AuthContext";

// SDD 6.2 Seller Dashboard: product management, inventory updates, sales tracking
const SellerDashboard = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", category: "", description: "", stock: "", images: "", discountPercent: "" });
  const [error, setError] = useState("");

  const load = async () => {
    const res = await api.get("/products", { params: { sellerId: user._id, limit: 100 } });
    setProducts(res.data.products);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/products", {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        images: form.images ? form.images.split(",").map((url) => url.trim()).filter(Boolean) : [],
        discountPercent: Number(form.discountPercent) || 0,
      });
      setForm({ name: "", price: "", category: "", description: "", stock: "", images: "", discountPercent: "" });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create product");
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/products/${id}`);
    load();
  };

  return (
    <div className="container">
      <div className="section-title">
        <h2>Seller Hub</h2>
        <span>{products.length} product(s) listed</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 24, alignItems: "start" }}>
        <div className="card">
          <h3 style={{ fontSize: 16 }}>Add New Product</h3>
          {error && <p className="error-text">{error}</p>}
          <form onSubmit={handleCreate}>
            <label className="field-label">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <label className="field-label">Price (Rs.)</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
            <label className="field-label">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            >
              <option value="" disabled>
                Select a category
              </option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <label className="field-label">Stock Quantity</label>
            <input
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              required
            />
            <label className="field-label">Image URLs (optional)</label>
            <input
              placeholder="https://.../img1.jpg, https://.../img2.jpg"
              value={form.images}
              onChange={(e) => setForm({ ...form, images: e.target.value })}
            />
            <p style={{ fontSize: 11.5, color: "var(--color-ink-soft)", margin: "-2px 0 4px" }}>
              Paste one or more direct image links, separated by commas, to enable a photo gallery. Leave blank to show a placeholder.
            </p>
            <label className="field-label">Discount % (optional, for flash sale)</label>
            <input
              type="number"
              min="0"
              max="90"
              placeholder="e.g. 15"
              value={form.discountPercent}
              onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
            />
            <label className="field-label">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <button className="btn" type="submit" style={{ width: "100%", marginTop: 12 }}>
              Add Product
            </button>
          </form>
        </div>

        <div>
          <h3 style={{ fontSize: 16, marginBottom: 12 }}>Your Products</h3>
          {products.length === 0 && (
            <div className="empty-state">
              <h3>No products yet</h3>
              <p>Add your first product using the form on the left.</p>
            </div>
          )}
          {products.map((p) => (
            <div
              key={p._id}
              className="card"
              style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <div>
                <strong style={{ fontFamily: "var(--font-display)" }}>{p.name}</strong>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-ink-soft)" }}>
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-primary)" }}>
                    Rs. {p.price?.toLocaleString()}
                  </span>{" "}
                  · Stock: {p.stock}
                  {p.discountPercent > 0 && (
                    <span className="badge badge-pending" style={{ marginLeft: 8 }}>
                      -{p.discountPercent}% deal
                    </span>
                  )}
                </p>
              </div>
              <button className="btn btn-danger" onClick={() => handleDelete(p._id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
