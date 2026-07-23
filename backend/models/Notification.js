const mongoose = require("mongoose");

// SRS 3.2.10 Notifications, 3.3.15 Notification System
const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["order_update", "offer", "system"],
      default: "system",
    },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
