const jwt = require("jsonwebtoken");

// SRS 1.3: JWT (JSON Web Token) - secure method for user authentication and authorization
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

module.exports = generateToken;
