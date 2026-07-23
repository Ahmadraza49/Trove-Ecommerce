import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const Checkout = () => {
  const [form, setForm] = useState({ fullName: "", address: "", city: "", phone: "" });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setPlacing(true);
    try {
      const res = await api.post("/orders", { shippingAddress: form, paymentMethod });
      navigate(`/orders/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not place order");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card" style={{ maxWidth: 440 }}>
        <h2>Checkout</h2>
        <p className="subtitle">Where should we send your order?</p>
        {error && <p className="error-text">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label className="field-label">Full Name</label>
          <input
            placeholder="Full Name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            required
          />
          <label className="field-label">Address</label>
          <input
            placeholder="House / street address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            required
          />
          <label className="field-label">City</label>
          <input
            placeholder="City"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            required
          />
          <label className="field-label">Phone</label>
          <input
            placeholder="03XXXXXXXXX"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />

          <label className="field-label">Payment Method</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
            <label
              className="card"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 14px",
                cursor: "pointer",
                borderColor: paymentMethod === "cod" ? "var(--color-accent)" : "var(--color-border)",
              }}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
                style={{ width: "auto", margin: 0 }}
              />
              <div>
                <strong style={{ fontSize: 13.5 }}>Cash on Delivery</strong>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--color-ink-soft)" }}>
                  Pay in cash when your order arrives.
                </p>
              </div>
            </label>

            <label
              className="card"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 14px",
                cursor: "pointer",
                borderColor: paymentMethod === "bank_transfer" ? "var(--color-accent)" : "var(--color-border)",
              }}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="bank_transfer"
                checked={paymentMethod === "bank_transfer"}
                onChange={() => setPaymentMethod("bank_transfer")}
                style={{ width: "auto", margin: 0 }}
              />
              <div>
                <strong style={{ fontSize: 13.5 }}>Bank Transfer / JazzCash / EasyPaisa</strong>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--color-ink-soft)" }}>
                  Transfer details will be shared after you place the order; your order ships
                  once payment is confirmed.
                </p>
              </div>
            </label>
          </div>

          <button className="btn" type="submit" style={{ width: "100%", marginTop: 18 }} disabled={placing}>
            {placing ? "Placing order..." : "Place Order"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
