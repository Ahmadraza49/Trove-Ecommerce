const mongoose = require("mongoose");

// SRS 3.2.4 Review and Rating System / SDD Reviews Collection
const reviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
  },
  { timestamps: true }
);

// A customer should review a product at most once
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
