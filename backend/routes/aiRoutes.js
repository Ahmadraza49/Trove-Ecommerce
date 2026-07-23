const express = require("express");
const { getRecommendations } = require("../controllers/aiController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Works for guests too (falls back to popularity-based recommendations)
const optionalAuth = async (req, res, next) => {
  if (!req.headers.authorization) return next();
  return protect(req, res, next);
};

router.get("/recommendations", optionalAuth, getRecommendations);

module.exports = router;
