import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

const Cart = () => {
  const [cart, setCart] = useState({ items: [] });
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    const res = await api.get("/cart");
    setCart(res.data);
    setLoaded(true);
  };

  useEffect(() => {
    load();
  }, []);

  const updateQty = async (productId, quantity) => {
    await api.put(`/cart/${productId}`, { quantity });
    load();
  };

  const removeItem = async (productId) => {
    await api.delete(`/cart/${productId}`);
    load();
  };

  const total = cart.items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  return (
    <div className="container">
      <div className="section-title">
        <h2>Your Cart</h2>
        <span>{cart.items.length} item(s)</span>
      </div>

      {loaded && cart.items.length === 0 && (
        <div className="empty-state">
          <h3>Your cart is empty</h3>
          <p>Browse products and add something you like.</p>
          <Link to="/" className="btn" style={{ marginTop: 14, display: "inline-flex" }}>
            Start Shopping
          </Link>
        </div>
      )}

      {cart.items.map((item) => (
        <div
          key={item.product._id}
          className="card"
          style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <div>
            <Link to={`/product/${item.product._id}`}>
              <strong style={{ fontFamily: "var(--font-display)" }}>{item.product.name}</strong>
            </Link>
            <p style={{ fontFamily: "var(--font-mono)", color: "var(--color-primary)", margin: "4px 0 0" }}>
              Rs. {item.product.price?.toLocaleString()} each
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="number"
              min="1"
              value={item.quantity}
              style={{ width: 64 }}
              onChange={(e) => updateQty(item.product._id, Number(e.target.value))}
            />
            <button className="btn btn-danger" onClick={() => removeItem(item.product._id)}>
              Remove
            </button>
          </div>
        </div>
      ))}

      {cart.items.length > 0 && (
        <div className="card" style={{ marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontFamily: "var(--font-mono)" }}>Total: Rs. {total.toLocaleString()}</h3>
          <button className="btn" onClick={() => navigate("/checkout")}>
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;
