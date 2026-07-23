import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const statusBadgeClass = (status) => {
  if (status === "delivered" || status === "confirmed") return "badge-success";
  if (status === "cancelled") return "badge-pending";
  return "badge-neutral";
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api.get("/orders/my").then((res) => {
      setOrders(res.data);
      setLoaded(true);
    });
  }, []);

  return (
    <div className="container">
      <div className="section-title">
        <h2>Your Orders</h2>
        <span>{orders.length} order(s)</span>
      </div>

      {loaded && orders.length === 0 && (
        <div className="empty-state">
          <h3>No orders yet</h3>
          <p>Once you place an order, you'll be able to track it here.</p>
        </div>
      )}

      {orders.map((o) => (
        <Link key={o._id} to={`/orders/${o._id}`}>
          <div
            className="card"
            style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}
          >
            <div>
              <p style={{ fontFamily: "var(--font-mono)", fontWeight: 600, margin: 0 }}>{o.trackingId}</p>
              <p style={{ fontSize: 12.5, color: "var(--color-ink-soft)", margin: "4px 0 0" }}>
                Placed on {new Date(o.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontFamily: "var(--font-mono)", fontWeight: 600, margin: "0 0 6px" }}>
                Rs. {o.totalPrice?.toLocaleString()}
              </p>
              <span className={`badge ${statusBadgeClass(o.status)}`}>{o.status}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Orders;
