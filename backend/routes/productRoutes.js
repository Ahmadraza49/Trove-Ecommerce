const express = require("express");
const {
  createProduct,
  updateProduct,
  deleteProduct,
  getProduct,
  getProducts,
} = require("../controllers/productController");
const { createReview, getProductReviews } = require("../controllers/reviewController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Attempt to attach req.user if a token is present, without requiring it (for browsing history tracking)
const optionalAuth = async (req, res, next) => {
  if (!req.headers.authorization) return next();
  return protect(req, res, next);
};

router.get("/", getProducts);
router.post("/", protect, authorize("seller", "admin"), createProduct);
router.get("/:id", optionalAuth, getProduct);
router.put("/:id", protect, authorize("seller", "admin"), updateProduct);
router.delete("/:id", protect, authorize("seller", "admin"), deleteProduct);

// 3.2.4 Review and Rating System
router.get("/:productId/reviews", getProductReviews);
router.post("/:productId/reviews", protect, createReview);

module.exports = router;
