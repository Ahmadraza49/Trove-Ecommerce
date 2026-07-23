const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// @desc  Register a new user (UC-01 User Registration)
// @route POST /api/auth/register
// @access Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const allowedRoles = ["buyer", "seller"]; // admin accounts are not self-registered
    const finalRole = allowedRoles.includes(role) ? role : "buyer";

    const userData = { name, email, password, role: finalRole };

    // SRS 2.2 Seller Store Management: auto-create a store profile for sellers
    if (finalRole === "seller") {
      userData.store = { name: `${name}'s Store`, description: "" };
    }

    const user = await User.create(userData);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    next(err);
  }
};

// @desc  Login user (UC-02 User Login)
// @route POST /api/auth/login
// @access Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    next(err);
  }
};

// @desc  Get current logged-in user's profile
// @route GET /api/auth/me
// @access Private
const getMe = async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (err) {
    next(err);
  }
};

// @desc  Update profile (part of User Class "Update profile" function)
// @route PUT /api/auth/me
// @access Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, store } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (store && user.role === "seller") user.store = { ...user.store, ...store };

    await user.save();
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// @desc  Get products the user has recently viewed (most recent first)
// @route GET /api/auth/recently-viewed
// @access Private
const getRecentlyViewed = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("browsingHistory");
    // browsingHistory is appended to via $addToSet as products are viewed,
    // so the most recently viewed item is at the end of the array.
    const recent = [...user.browsingHistory].reverse().slice(0, 10);
    res.json(recent);
  } catch (err) {
    next(err);
  }
};

module.exports = { registerUser, loginUser, getMe, updateProfile, getRecentlyViewed };
