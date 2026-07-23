const Notification = require("../models/Notification");

// @desc  Get logged-in user's notifications
// @route GET /api/notifications
// @access Private
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    next(err);
  }
};

// @desc  Mark a notification as read
// @route PUT /api/notifications/:id/read
// @access Private
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    res.json(notification);
  } catch (err) {
    next(err);
  }
};

module.exports = { getNotifications, markAsRead };
