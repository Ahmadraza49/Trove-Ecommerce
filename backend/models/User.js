const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// SRS 3.4 "User Class": User ID, Name, Email, Password, Role (Buyer/Seller/Admin)
// SDD 4.2 Data Dictionary -> Users Collection
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ["buyer", "seller", "admin"],
      default: "buyer",
    },
    // SRS 2.2 "Seller Store Management": a store/profile is auto-created for each seller
    store: {
      name: { type: String },
      description: { type: String },
    },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    // used as lightweight signal for the AI Recommendation module (SRS 3.2.7)
    browsingHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);
