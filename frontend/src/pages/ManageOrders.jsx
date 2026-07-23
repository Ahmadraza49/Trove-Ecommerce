import { useEffect, useState } from "react";
import api from "../api/axios";

const STATUS_OPTIONS = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const PAYMENT_OPTIONS = ["pending", "paid", "failed"];

const statusBadgeClass = (status) => {
  if (status === "delivered" || status === "confirmed") return "badge-success";
  if (status === "cancelled") return "badge-pending";
  return "badge-neutral";
};

// Fulfillment screen for a manual/COD dropshipping workflow:
// see every order that needs action, buy the item from your supplier,
// book it with a courier (e.g. TCS), then log the tracking number here.
const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [drafts, setDrafts] = useState({});

  const load = async () => {
    const res = await api.get("/orders");
    setOrders(res.data);
    setLoaded(true);
    const nextDrafts = {};
    res.data.forEach((o) => {
      nextDrafts[o._id] = {
        status: o.status,
        paymentStatus: o.paymentStatus,
        courierTrackingNumber: o.courierTrackingNumber || "",
      };
    });
    setDrafts(nextDrafts);
  };

  useEffect(() => {
    load();
  }, []);

  const updateDraft = (id, field, value) => {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const saveOrder = async (id) => {
    setSavingId(id);
    try {
      await api.put(`/orders/${id}/status`, drafts[id]);
      await load();
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="container">
      <div className="section-title">
        <h2>Manage Orders</h2>
        <span>{orders.length} order(s) to fulfill</span>
      </div>

      {loaded && orders.length === 0 && (
        <div className="empty-state">
          <h3>No orders yet</h3>
          <p>Orders containing your products will show up here as customers buy them.</p>
        </div>
      )}

      {orders.map((o) => {
        const draft = drafts[o._id] || {};
        return (
          <div key={o._id} className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
              <div>
                <p style={{ fontFamily: "var(--font-mono)", fontWeight: 700, margin: 0 }}>{o.trackingId}</p>
                <p style={{ fontSize: 12, color: "var(--color-ink-soft)", margin: "4px 0 0" }}>
                  Placed {new Date(o.createdAt).toLocaleDateString()} · {o.paymentMethod === "cod" ? "Cash on Delivery" : "Bank Transfer"}
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span className={`badge ${statusBadgeClass(o.status)}`}>{o.status}</span>
                <span className="badge badge-neutral">payment: {o.paymentStatus}</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 14 }}>
              <div>
                <h4 style={{ fontSize: 13, marginBottom: 6 }}>Customer</h4>
                <p style={{ margin: 0, fontSize: 13, color: "var(--color-ink-soft)" }}>
                  {o.shippingAddress?.fullName} · {o.shippingAddress?.phone}
                  <br />
                  {o.shippingAddress?.address}, {o.shippingAddress?.city}
                  <br />
                  Account: {o.user?.name} ({o.user?.email})
                </p>
              </div>
              <div>
                <h4 style={{ fontSize: 13, marginBottom: 6 }}>Items</h4>
                {o.products.map((p) => (
                  <p key={p.product?._id} style={{ margin: "0 0 4px", fontSize: 13, color: "var(--color-ink-soft)" }}>
                    {p.product?.name} × {p.quantity} — Rs. {(p.price * p.quantity).toLocaleString()}
                  </p>
                ))}
                <p style={{ margin: "6px 0 0", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                  Total: Rs. {o.totalPrice?.toLocaleString()}
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.4fr auto", gap: 10, alignItems: "end" }}>
              <div>
                <label className="field-label" style={{ margin: "0 0 4px" }}>Order Status</label>
                <select value={draft.status} onChange={(e) => updateDraft(o._id, "status", e.target.value)}>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label" style={{ margin: "0 0 4px" }}>Payment Status</label>
                <select value={draft.paymentStatus} onChange={(e) => updateDraft(o._id, "paymentStatus", e.target.value)}>
                  {PAYMENT_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label" style={{ margin: "0 0 4px" }}>Courier Tracking # (e.g. TCS)</label>
                <input
                  placeholder="TCS slip / tracking number"
                  value={draft.courierTrackingNumber}
                  onChange={(e) => updateDraft(o._id, "courierTrackingNumber", e.target.value)}
                />
              </div>
              <button className="btn" onClick={() => saveOrder(o._id)} disabled={savingId === o._id}>
                {savingId === o._id ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ManageOrders;
