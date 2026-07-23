const jwt = require("jsonwebtoken");
const User = require("../models/User");

// SRS 3.2.1 User Authentication: validates JWT generated at login
const protect = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      return res.status(401).json({ message: "User no longer exists" });
    }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized, invalid or expired token" });
  }
};

// Role-based access control, e.g. authorize("admin"), authorize("seller", "admin")
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: insufficient permissions" });
    }
    next();
  };
};

module.exports = { protect, authorize };
