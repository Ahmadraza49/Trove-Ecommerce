const mongoose = require("mongoose");

// SRS 3.4 "Product Class": Product ID, Name, Price, Category, Description, Stock quantity
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, index: true },
    description: { type: String, default: "" },
    stock: { type: Number, required: true, default: 0, min: 0 },
    images: [{ type: String }],
    // Optional discount for flash-sale / deal display (0-90%)
    discountPercent: { type: Number, default: 0, min: 0, max: 90 },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // FQ-08: reviews and ratings
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text", category: "text" });

module.exports = mongoose.model("Product", productSchema);
