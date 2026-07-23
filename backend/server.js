require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const aiRoutes = require("./routes/aiRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");

connectDB();

const app = express();
const server = http.createServer(app);

// SRS 3.1.5 Communication Interfaces: WebSockets (Socket.IO) for real-time updates
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || "*" },
});

io.on("connection", (socket) => {
  // Each user joins a private room keyed by their userId so we can target
  // order-update / notification events to just them (see orderController).
  socket.on("join", (userId) => {
    if (userId) socket.join(userId);
  });
});

app.set("io", io);

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
