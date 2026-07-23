import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { PAYMENT_DETAILS } from "../constants";

const STEPS = ["pending", "confirmed", "shipped", "delivered"];

const statusBadgeClass = (status) => {
  if (status === "delivered" || status === "confirmed") return "badge-success";
  if (status === "cancelled") return "badge-pending";
  return "badge-neutral";
};

const OrderDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then((res) => setOrder(res.data));
  }, [id]);

  // Live order-status updates (SRS 3.1.5 Communication Interfaces: WebSockets)
  useEffect(() => {
    if (!user) return;
    const socket = io("/", { path: "/socket.io" });
    socket.emit("join", user._id);
    socket.on("orderUpdate", (updated) => {
      if (updated._id === id) setOrder(updated);
    });
    return () => socket.disconnect();
  }, [user, id]);

  if (!order) return <p className="container">Loading...</p>;

  const stepIndex = STEPS.indexOf(order.status);

  return (
    <div className="container" style={{ maxWidth: 720 }}>
      <div className="section-title">
        <h2 style={{ fontFamily: "var(--font-mono)" }}>{order.trackingId}</h2>
        <span className={`badge ${statusBadgeClass(order.status)}`}>{order.status}</span>
      </div>

      {order.status !== "cancelled" && (
        <div className="card" style={{ marginBottom: 20, display: "flex", justifyContent: "space-between" }}>
          {STEPS.map((step, i) => (
            <div key={step} style={{ textAlign: "center", flex: 1, position: "relative" }}>
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  margin: "0 auto 6px",
                  background: i <= stepIndex ? "var(--color-success)" : "var(--color-border)",
                }}
              />
              <span style={{ fontSize: 11.5, textTransform: "capitalize", color: "var(--color-ink-soft)" }}>
                {step}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 16 }}>Items</h3>
        {order.products.map((p) => (
          <div
            key={p.product._id}
            style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: "1px solid var(--color-border)" }}
          >
            <span>
              {p.product.name} × {p.quantity}
            </span>
            <span style={{ fontFamily: "var(--font-mono)" }}>Rs. {(p.price * p.quantity).toLocaleString()}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, marginTop: 6, borderTop: "2px solid var(--color-border)", fontWeight: 700 }}>
          <span>Total</span>
          <span style={{ fontFamily: "var(--font-mono)" }}>Rs. {order.totalPrice?.toLocaleString()}</span>
        </div>
      </div>

      {order.shippingAddress && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 16 }}>Shipping Address</h3>
          <p style={{ margin: 0, color: "var(--color-ink-soft)" }}>
            {order.shippingAddress.fullName}, {order.shippingAddress.address}, {order.shippingAddress.city} (
            {order.shippingAddress.phone})
          </p>
        </div>
      )}

      {order.paymentMethod === "bank_transfer" && order.paymentStatus === "pending" && (
        <div className="card" style={{ marginBottom: 16, borderColor: "var(--color-accent)", background: "var(--color-accent-tint)" }}>
          <h3 style={{ fontSize: 16 }}>Complete your payment</h3>
          <p style={{ fontSize: 13, color: "var(--color-ink-soft)", marginBottom: 10 }}>
            Please send <strong>Rs. {order.totalPrice?.toLocaleString()}</strong> using one of the methods below,
            then message us on WhatsApp ({PAYMENT_DETAILS.contactWhatsapp}) with a screenshot and your tracking ID
            ({order.trackingId}) so we can confirm it. Your order ships once payment is confirmed.
          </p>
          <div className="buy-box__row"><strong style={{ minWidth: 130 }}>Bank</strong> {PAYMENT_DETAILS.bankName}</div>
          <div className="buy-box__row"><strong style={{ minWidth: 130 }}>Account Title</strong> {PAYMENT_DETAILS.accountTitle}</div>
          <div className="buy-box__row"><strong style={{ minWidth: 130 }}>Account Number</strong> <span style={{ fontFamily: "var(--font-mono)" }}>{PAYMENT_DETAILS.accountNumber}</span></div>
          <div className="buy-box__row"><strong style={{ minWidth: 130 }}>IBAN</strong> <span style={{ fontFamily: "var(--font-mono)" }}>{PAYMENT_DETAILS.iban}</span></div>
          <div className="buy-box__row"><strong style={{ minWidth: 130 }}>JazzCash</strong> <span style={{ fontFamily: "var(--font-mono)" }}>{PAYMENT_DETAILS.jazzCashNumber}</span></div>
          <div className="buy-box__row"><strong style={{ minWidth: 130 }}>EasyPaisa</strong> <span style={{ fontFamily: "var(--font-mono)" }}>{PAYMENT_DETAILS.easyPaisaNumber}</span></div>
        </div>
      )}

      <div className="card">
        <h3 style={{ fontSize: 16 }}>Payment & Delivery</h3>
        <div className="buy-box__row">
          <strong style={{ minWidth: 140 }}>Payment method</strong>
          {order.paymentMethod === "bank_transfer" ? "Bank Transfer / JazzCash / EasyPaisa" : "Cash on Delivery"}
        </div>
        <div className="buy-box__row">
          <strong style={{ minWidth: 140 }}>Payment status</strong>
          <span className={`badge ${order.paymentStatus === "paid" ? "badge-success" : "badge-pending"}`}>
            {order.paymentStatus}
          </span>
        </div>
        {order.courierTrackingNumber && (
          <div className="buy-box__row">
            <strong style={{ minWidth: 140 }}>Courier tracking #</strong>
            <span style={{ fontFamily: "var(--font-mono)" }}>{order.courierTrackingNumber}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
