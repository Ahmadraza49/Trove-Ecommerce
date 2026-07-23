const Review = require("../models/Review");
const Product = require("../models/Product");

const recalcProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: "$product", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  const { avg = 0, count = 0 } = stats[0] || {};
  await Product.findByIdAndUpdate(productId, {
    ratingAverage: Math.round(avg * 10) / 10,
    ratingCount: count,
  });
};

// @desc  Submit a review (UC-13 Product Review and Rating)
// @route POST /api/products/:productId/reviews
// @access Private
const createReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    // 3.2.4 Error Handling: prevent empty reviews / invalid rating values
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const review = await Review.create({
      product: product._id,
      user: req.user._id,
      rating,
      comment,
    });

    await recalcProductRating(product._id);

    res.status(201).json(review);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }
    next(err);
  }
};

// @desc  Get reviews for a product
// @route GET /api/products/:productId/reviews
// @access Public
const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};

module.exports = { createReview, getProductReviews };
