const express = require("express");
const { registerUser, loginUser, getMe, updateProfile, getRecentlyViewed } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.put("/me", protect, updateProfile);
router.get("/recently-viewed", protect, getRecentlyViewed);

module.exports = router;
