const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Notification = require("../models/Notification");
const generateTrackingId = require("../utils/generateTrackingId");

// @desc  Place an order from the current cart (UC-05 Place Order)
// @route POST /api/orders
// @access Private
const placeOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Validate stock and build order line items (3.2.3 Processing)
    let totalPrice = 0;
    const orderProducts = [];
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        // 3.2.3 Error Handling: payment/transaction error handling
        return res.status(400).json({
          message: `Insufficient stock for ${item.product.name}`,
        });
      }
      orderProducts.push({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      });
      totalPrice += item.product.price * item.quantity;
    }

    // No online payment gateway is wired up (see README) — orders are
    // fulfilled manually via Cash on Delivery or a bank transfer that the
    // seller/admin confirms by hand, so payment always starts as "pending".
    const method = paymentMethod === "bank_transfer" ? "bank_transfer" : "cod";

    const order = await Order.create({
      user: req.user._id,
      products: orderProducts,
      totalPrice,
      status: "pending",
      paymentMethod: method,
      paymentStatus: "pending",
      trackingId: generateTrackingId(),
      shippingAddress,
    });

    // Decrease stock for each purchased product
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear the cart after successful checkout
    cart.items = [];
    await cart.save();

    // 3.2.10 Notifications: notify the customer of order confirmation
    await Notification.create({
      user: req.user._id,
      type: "order_update",
      message:
        method === "cod"
          ? `Your order has been placed (Cash on Delivery). Tracking ID: ${order.trackingId}`
          : `Your order has been placed. Please complete the bank transfer and await confirmation. Tracking ID: ${order.trackingId}`,
    });

    // Emit real-time update over Socket.IO if available (SRS 3.1.5 Communication Interfaces)
    const io = req.app.get("io");
    if (io) io.to(req.user._id.toString()).emit("orderUpdate", order);

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

// @desc  Get logged-in user's order history
// @route GET /api/orders/my
// @access Private
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("products.product", "name price images")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

// @desc  Get orders to fulfill — all orders for admin, or orders containing
//        at least one of the seller's own products for a seller account.
//        This is what powers the "Manage Orders" screen: full shipping
//        address + items, so you can buy from your supplier and book a
//        courier (e.g. TCS) against each order.
// @route GET /api/orders
// @access Private (seller, admin)
const getFulfillmentOrders = async (req, res, next) => {
  try {
    let orders;
    if (req.user.role === "admin") {
      orders = await Order.find({})
        .populate("products.product", "name price images seller")
        .populate("user", "name email")
        .sort({ createdAt: -1 });
    } else {
      const myProductIds = await Product.find({ seller: req.user._id }).distinct("_id");
      orders = await Order.find({ "products.product": { $in: myProductIds } })
        .populate("products.product", "name price images seller")
        .populate("user", "name email")
        .sort({ createdAt: -1 });
    }
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

// @desc  Track a specific order (UC-07 Order Tracking)
// @route GET /api/orders/:id
// @access Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("products.product", "name price images seller")
      .populate("user", "name email");
    if (!order) {
      // 3.2.9 Error Handling: "Displays error if order not found"
      return res.status(404).json({ message: "Order not found" });
    }

    const isOwner = order.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    const isFulfillingSeller =
      req.user.role === "seller" &&
      order.products.some((p) => p.product?.seller?.toString() === req.user._id.toString());

    if (!isOwner && !isAdmin && !isFulfillingSeller) {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
};

// @desc  Update order status / payment status / courier tracking number
//        (seller/admin — order processing pseudo-code in SDD 5.2)
// @route PUT /api/orders/:id/status
// @access Private (seller, admin)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, paymentStatus, courierTrackingNumber } = req.body;
    const order = await Order.findById(req.params.id).populate("products.product", "seller");
    if (!order) return res.status(404).json({ message: "Order not found" });

    const isAdmin = req.user.role === "admin";
    const isFulfillingSeller = order.products.some(
      (p) => p.product?.seller?.toString() === req.user._id.toString()
    );
    if (!isAdmin && !isFulfillingSeller) {
      return res.status(403).json({ message: "Not authorized to update this order" });
    }

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (courierTrackingNumber !== undefined) order.courierTrackingNumber = courierTrackingNumber;
    await order.save();

    if (status || paymentStatus) {
      const parts = [];
      if (status) parts.push(`status changed to "${status}"`);
      if (paymentStatus) parts.push(`payment marked "${paymentStatus}"`);
      await Notification.create({
        user: order.user._id || order.user,
        type: "order_update",
        message: `Your order (${order.trackingId}) ${parts.join(" and ")}.`,
      });
    }

    const io = req.app.get("io");
    if (io) io.to((order.user._id || order.user).toString()).emit("orderUpdate", order);

    res.json(order);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  placeOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getFulfillmentOrders,
};
