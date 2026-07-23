const Cart = require("../models/Cart");
const Product = require("../models/Product");

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
};

// @desc  Get current user's cart
// @route GET /api/cart
// @access Private
const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    res.json(cart || { user: req.user._id, items: [] });
  } catch (err) {
    next(err);
  }
};

// @desc  Add item to cart (UC-04 Add to Cart)
// @route POST /api/cart
// @access Private
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.stock < quantity) {
      // 3.2.5 Error Handling: "Displays error if product is out of stock"
      return res.status(400).json({ message: "Product is out of stock" });
    }

    const cart = await getOrCreateCart(req.user._id);
    const existingItem = cart.items.find((i) => i.product.toString() === productId);

    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    const populated = await cart.populate("items.product");
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

// @desc  Remove item from cart (UC-11 Remove from Cart)
// @route DELETE /api/cart/:productId
// @access Private
const removeFromCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
    await cart.save();
    const populated = await cart.populate("items.product");
    res.json(populated);
  } catch (err) {
    next(err);
  }
};

// @desc  Update item quantity in cart
// @route PUT /api/cart/:productId
// @access Private
const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await getOrCreateCart(req.user._id);
    const item = cart.items.find((i) => i.product.toString() === req.params.productId);

    if (!item) return res.status(404).json({ message: "Item not in cart" });
    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    const populated = await cart.populate("items.product");
    res.json(populated);
  } catch (err) {
    next(err);
  }
};

module.exports = { getCart, addToCart, removeFromCart, updateCartItem };
