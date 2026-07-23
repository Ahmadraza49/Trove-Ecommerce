const Product = require("../models/Product");
const User = require("../models/User");

// @desc  Add product (UC-08 Admin/Seller Product Management)
// @route POST /api/products
// @access Private (seller, admin)
const createProduct = async (req, res, next) => {
  try {
    const { name, price, category, description, stock, images, discountPercent } = req.body;

    if (!name || price == null || !category) {
      return res.status(400).json({ message: "name, price and category are required" });
    }

    const product = await Product.create({
      name,
      price,
      category,
      description,
      stock: stock || 0,
      images: images || [],
      discountPercent: discountPercent || 0,
      seller: req.user._id,
    });

    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

// @desc  Update product
// @route PUT /api/products/:id
// @access Private (owning seller, admin)
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const isOwner = product.seller.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this product" });
    }

    Object.assign(product, req.body);
    await product.save();
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// @desc  Delete product
// @route DELETE /api/products/:id
// @access Private (owning seller, admin)
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const isOwner = product.seller.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this product" });
    }

    await product.deleteOne();
    res.json({ message: "Product removed" });
  } catch (err) {
    next(err);
  }
};

// @desc  Get single product + track browsing history for AI recommendations (3.2.7)
// @route GET /api/products/:id
// @access Public
const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate("seller", "name store");
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Track browsing history when a logged-in user views a product (feeds AI recommendation)
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { browsingHistory: product._id },
      });
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
};

// @desc  Search & filter products (3.2.6, UC-03, UC-09)
// @route GET /api/products?keyword=&category=&minPrice=&maxPrice=&sort=
// @access Public
const getProducts = async (req, res, next) => {
  try {
    const { keyword, category, minPrice, maxPrice, sort, sellerId, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (keyword) {
      filter.$text = { $search: keyword };
    }
    if (category) {
      const escaped = category.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.category = new RegExp(`^${escaped}$`, "i");
    }
    if (sellerId) {
      filter.seller = sellerId;
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let query = Product.find(filter);

    if (sort === "price_asc") query = query.sort({ price: 1 });
    else if (sort === "price_desc") query = query.sort({ price: -1 });
    else if (sort === "rating") query = query.sort({ ratingAverage: -1 });
    else query = query.sort({ createdAt: -1 });

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      query.skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    if (products.length === 0) {
      return res.json({ products: [], total: 0, message: "No products found matching your criteria" });
    }

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

module.exports = { createProduct, updateProduct, deleteProduct, getProduct, getProducts };
