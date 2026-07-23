const mongoose = require("mongoose");

// SRS 3.4 "Order Class": Order ID, User ID, Product list, Total price, Status
const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true }, // price at time of order
      },
    ],
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      // 3.3.7 Order Tracking flow
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    trackingId: { type: String, unique: true },
    // Manually entered once you book the shipment with a courier (e.g. TCS slip number)
    courierTrackingNumber: { type: String, default: "" },
    shippingAddress: {
      fullName: String,
      address: String,
      city: String,
      phone: String,
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "bank_transfer"],
      default: "cod",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
