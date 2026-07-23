const express = require("express");
const {
  placeOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getFulfillmentOrders,
} = require("../controllers/orderController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.post("/", placeOrder);
router.get("/my", getMyOrders);
router.get("/", authorize("seller", "admin"), getFulfillmentOrders);
router.get("/:id", getOrderById);
router.put("/:id/status", authorize("seller", "admin"), updateOrderStatus);

module.exports = router;
