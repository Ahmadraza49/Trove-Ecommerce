const express = require("express");
const { chatWithBot } = require("../controllers/chatbotController");
const { protect } = require("../middleware/auth");

const router = express.Router();

const optionalAuth = async (req, res, next) => {
  if (!req.headers.authorization) return next();
  return protect(req, res, next);
};

router.post("/", optionalAuth, chatWithBot);

module.exports = router;
