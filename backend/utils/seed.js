// Demo-data seeder: run with `npm run seed` after setting up .env
// Fills the store with a realistic catalog across every category so the
// buyer homepage isn't empty on first run.
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Product = require("../models/Product");
const Review = require("../models/Review");

const PRODUCTS = [
  // Electronics
  { name: "Wireless Headphones", price: 4500, category: "Electronics", stock: 25, discountPercent: 20, description: "Bluetooth over-ear headphones with active noise cancellation and 30-hour battery life.", images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"] },
  { name: "Smart Watch", price: 8500, category: "Electronics", stock: 15, description: "Fitness tracking smart watch with heart-rate monitor and sleep tracking.", images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"] },
  { name: "Bluetooth Speaker", price: 3200, category: "Electronics", stock: 30, discountPercent: 10, description: "Portable waterproof speaker with rich bass and 12-hour playtime.", images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500"] },
  { name: "4K Action Camera", price: 12500, category: "Electronics", stock: 8, description: "Waterproof 4K action camera with image stabilization, ideal for travel vlogging.", images: ["https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500"] },
  { name: "Mechanical Keyboard", price: 6900, category: "Electronics", stock: 18, discountPercent: 12, description: "RGB backlit mechanical keyboard with hot-swappable switches.", images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500"] },
  { name: "Wireless Mouse", price: 1800, category: "Electronics", stock: 45, description: "Ergonomic wireless mouse with silent clicks and 1600 DPI.", images: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500"] },
  { name: "Power Bank 20000mAh", price: 3500, category: "Electronics", stock: 35, discountPercent: 8, description: "Fast-charging power bank with dual USB output.", images: ["https://images.unsplash.com/photo-1609592806596-4d1b5e5e6b8f?w=500"] },

  // Footwear
  { name: "Running Shoes", price: 3200, category: "Footwear", stock: 40, discountPercent: 15, description: "Lightweight breathable running shoes with responsive cushioning.", images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"] },
  { name: "Casual Sneakers", price: 2800, category: "Footwear", stock: 32, description: "Everyday canvas sneakers, comfortable for all-day wear.", images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500"] },
  { name: "Leather Formal Shoes", price: 4200, category: "Footwear", stock: 20, description: "Genuine leather formal shoes for office and events.", images: ["https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=500"] },
  { name: "Hiking Boots", price: 5600, category: "Footwear", stock: 14, discountPercent: 18, description: "Waterproof hiking boots with reinforced ankle support.", images: ["https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=500"] },

  // Fashion
  { name: "Leather Backpack", price: 5200, category: "Fashion", stock: 20, description: "Durable leather backpack with a padded laptop compartment.", images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500"] },
  { name: "Denim Jacket", price: 3800, category: "Fashion", stock: 25, discountPercent: 10, description: "Classic unisex denim jacket, machine washable.", images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500"] },
  { name: "Analog Wrist Watch", price: 4600, category: "Fashion", stock: 18, description: "Minimalist analog watch with a genuine leather strap.", images: ["https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500"] },
  { name: "Sunglasses", price: 1900, category: "Fashion", stock: 40, discountPercent: 25, description: "UV-protection polarized sunglasses with a lightweight frame.", images: ["https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500"] },
  { name: "Cotton Kurta", price: 2400, category: "Fashion", stock: 30, description: "Breathable cotton kurta, perfect for everyday wear.", images: ["https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=500"] },

  // Home & Living
  { name: "Ceramic Cookware Set", price: 6800, category: "Home & Living", stock: 12, description: "Non-stick ceramic cookware set, 5 pieces, PFOA-free.", images: ["https://images.unsplash.com/photo-1584990347449-a5d9f800a783?w=500"] },
  { name: "Memory Foam Pillow", price: 2200, category: "Home & Living", stock: 28, discountPercent: 15, description: "Orthopedic memory foam pillow for better neck support.", images: ["https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=500"] },
  { name: "Table Lamp", price: 2600, category: "Home & Living", stock: 22, description: "Modern LED table lamp with adjustable brightness.", images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500"] },
  { name: "Storage Organizer Set", price: 1800, category: "Home & Living", stock: 33, description: "Stackable storage bins for closets and pantries, set of 6.", images: ["https://images.unsplash.com/photo-1558442074-3c19857bc1dc?w=500"] },

  // Beauty
  { name: "Skincare Gift Set", price: 3400, category: "Beauty", stock: 20, discountPercent: 20, description: "Cleanser, toner, and moisturizer set for all skin types.", images: ["https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500"] },
  { name: "Hair Dryer", price: 2900, category: "Beauty", stock: 18, description: "Ionic hair dryer with 3 heat settings and cool-shot button.", images: ["https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500"] },
  { name: "Perfume — Citrus Bloom", price: 4100, category: "Beauty", stock: 26, description: "Long-lasting citrus-floral eau de parfum, 100ml.", images: ["https://images.unsplash.com/photo-1541643600914-78b084683601?w=500"] },

  // Sports
  { name: "Yoga Mat", price: 1600, category: "Sports", stock: 40, discountPercent: 10, description: "Non-slip 6mm yoga mat with carry strap.", images: ["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500"] },
  { name: "Adjustable Dumbbell Set", price: 7800, category: "Sports", stock: 10, description: "Space-saving adjustable dumbbells, 5-25kg per hand.", images: ["https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=500"] },
  { name: "Football", price: 1900, category: "Sports", stock: 35, description: "Match-quality size 5 football, all-weather use.", images: ["https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=500"] },

  // Books
  { name: "The Art of Clean Code", price: 2200, category: "Books", stock: 22, description: "A practical guide to writing maintainable software.", images: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500"] },
  { name: "Modern Web Design", price: 1950, category: "Books", stock: 26, discountPercent: 12, description: "A visual guide to contemporary UI and UX principles.", images: ["https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500"] },
  { name: "Business Strategy Essentials", price: 2500, category: "Books", stock: 18, description: "Core frameworks for startup and business strategy.", images: ["https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500"] },

  // Groceries — fruits, vegetables, dairy, bakery, beverages, pantry staples, snacks
  { name: "Fresh Bananas (1 dozen)", price: 240, category: "Groceries", stock: 60, description: "Farm-fresh ripe bananas, sold by the dozen.", images: ["https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500"] },
  { name: "Red Apples (1kg)", price: 380, category: "Groceries", stock: 50, discountPercent: 10, description: "Crisp, sweet red apples, hand-picked and packed fresh.", images: ["https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500"] },
  { name: "Fresh Tomatoes (1kg)", price: 160, category: "Groceries", stock: 70, description: "Vine-ripened tomatoes, ideal for cooking and salads.", images: ["https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=500"] },
  { name: "Potatoes (5kg bag)", price: 450, category: "Groceries", stock: 40, description: "Everyday cooking potatoes, sold in a 5kg pack.", images: ["https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500"] },
  { name: "Whole Milk (1L)", price: 280, category: "Groceries", stock: 55, description: "Pasteurized whole milk, rich and creamy.", images: ["https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500"] },
  { name: "Farm Eggs (Dozen)", price: 350, category: "Groceries", stock: 45, discountPercent: 8, description: "Free-range eggs, a dozen per pack.", images: ["https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?w=500"] },
  { name: "Sliced Wheat Bread", price: 190, category: "Groceries", stock: 38, description: "Soft whole-wheat sandwich bread, freshly baked.", images: ["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500"] },
  { name: "Basmati Rice (5kg)", price: 1450, category: "Groceries", stock: 30, description: "Premium long-grain basmati rice, aromatic and fluffy.", images: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500"] },
  { name: "Cooking Oil (Sunflower, 3L)", price: 1650, category: "Groceries", stock: 26, discountPercent: 12, description: "Light, cholesterol-free sunflower cooking oil.", images: ["https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500"] },
  { name: "Green Tea Bags (100 ct)", price: 620, category: "Groceries", stock: 42, description: "Antioxidant-rich green tea, 100 bags per box.", images: ["https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=500"] },
  { name: "Mixed Nuts (500g)", price: 1200, category: "Groceries", stock: 33, description: "A roasted blend of almonds, cashews, and pistachios.", images: ["https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500"] },
  { name: "Sparkling Water (12-pack)", price: 840, category: "Groceries", stock: 28, discountPercent: 15, description: "Naturally carbonated sparkling water, 12 cans.", images: ["https://images.unsplash.com/photo-1523371054106-bbf80586c38c?w=500"] },
];

const SAMPLE_COMMENTS = [
  "Great value for the price, works exactly as described.",
  "Delivery was quick and packaging was solid.",
  "Good quality overall, would buy again.",
  "Does the job well, no complaints so far.",
  "Better than I expected for this price range.",
];

const run = async () => {
  await connectDB();

  await Promise.all([User.deleteMany({}), Product.deleteMany({}), Review.deleteMany({})]);

  await User.create({
    name: "Admin",
    email: "admin@example.com",
    password: "admin123",
    role: "admin",
  });

  const seller = await User.create({
    name: "Ahmad Raza",
    email: "seller@example.com",
    password: "seller123",
    role: "seller",
    store: { name: "Ahmad's Store", description: "General merchandise across every category" },
  });

  const buyer1 = await User.create({
    name: "Test Buyer",
    email: "buyer@example.com",
    password: "buyer123",
    role: "buyer",
  });

  const buyer2 = await User.create({
    name: "Sara Khan",
    email: "sara@example.com",
    password: "buyer123",
    role: "buyer",
  });

  const products = await Product.insertMany(
    PRODUCTS.map((p) => ({ ...p, seller: seller._id }))
  );

  // Seed a handful of reviews so most products show a real rating instead of "New"
  const reviewers = [buyer1, buyer2];
  const reviewDocs = [];
  products.forEach((product, i) => {
    if (i % 3 === 2) return; // leave every 3rd product with no reviews, marked "New"
    const reviewCount = 1 + (i % 2);
    for (let r = 0; r < reviewCount; r++) {
      reviewDocs.push({
        product: product._id,
        user: reviewers[r % reviewers.length]._id,
        rating: 3 + ((i + r) % 3), // ratings between 3 and 5
        comment: SAMPLE_COMMENTS[(i + r) % SAMPLE_COMMENTS.length],
      });
    }
  });

  await Review.insertMany(reviewDocs, { ordered: false }).catch(() => {});

  // Recalculate rating averages per product (mirrors reviewController's recalcProductRating)
  for (const product of products) {
    const stats = await Review.aggregate([
      { $match: { product: product._id } },
      { $group: { _id: "$product", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    const { avg = 0, count = 0 } = stats[0] || {};
    await Product.findByIdAndUpdate(product._id, {
      ratingAverage: Math.round(avg * 10) / 10,
      ratingCount: count,
    });
  }

  console.log(`Seed data created: ${products.length} products across ${new Set(PRODUCTS.map((p) => p.category)).size} categories, ${reviewDocs.length} reviews.`);
  console.log("Login accounts:");
  console.log("  admin@example.com  / admin123  (admin)");
  console.log("  seller@example.com / seller123 (seller — owns all demo products)");
  console.log("  buyer@example.com  / buyer123  (buyer)");
  console.log("  sara@example.com   / buyer123  (buyer)");

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
