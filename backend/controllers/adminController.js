const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

// @desc  List all users (Admin Dashboard -> User management)
// @route GET /api/admin/users
// @access Private (admin)
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// @desc  Change a user's role or deactivate (basic admin control)
// @route PUT /api/admin/users/:id
// @access Private (admin)
const updateUser = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (role) user.role = role;
    await user.save();
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// @desc  System analytics summary (Admin Dashboard -> System analytics)
// @route GET /api/admin/analytics
// @access Private (admin)
const getAnalytics = async (req, res, next) => {
  try {
    const [userCount, productCount, orderCount, revenueAgg] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
    ]);

    res.json({
      totalUsers: userCount,
      totalProducts: productCount,
      totalOrders: orderCount,
      totalRevenue: revenueAgg[0]?.total || 0,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsers, updateUser, getAnalytics };
