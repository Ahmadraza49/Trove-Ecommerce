const User = require("../models/User");

// @desc  Get current user's wishlist
// @route GET /api/wishlist
// @access Private
const getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist");
    res.json(user.wishlist);
  } catch (err) {
    next(err);
  }
};

// @desc  Add/remove product from wishlist (UC-12 Wishlist Management)
// @route POST /api/wishlist/:productId
// @access Private
const toggleWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const { productId } = req.params;

    const exists = user.wishlist.some((id) => id.toString() === productId);
    if (exists) {
      user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
    } else {
      user.wishlist.push(productId);
    }

    await user.save();
    res.json({ wishlist: user.wishlist, added: !exists });
  } catch (err) {
    next(err);
  }
};

module.exports = { getWishlist, toggleWishlist };
