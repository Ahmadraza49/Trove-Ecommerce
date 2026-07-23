const express = require("express");
const { getCart, addToCart, removeFromCart, updateCartItem } = require("../controllers/cartController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/", getCart);
router.post("/", addToCart);
router.put("/:productId", updateCartItem);
router.delete("/:productId", removeFromCart);

module.exports = router;
