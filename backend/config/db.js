const mongoose = require("mongoose");

// 3.1 Software Interfaces (SRS 3.1.4) -> MongoDB as the Database Layer (SDD Section 3)
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
