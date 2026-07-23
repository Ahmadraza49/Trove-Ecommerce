const express = require("express");
const { getWishlist, toggleWishlist } = require("../controllers/wishlistController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/", getWishlist);
router.post("/:productId", toggleWishlist);

module.exports = router;
