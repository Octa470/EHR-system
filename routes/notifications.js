const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const { verifyRole } = require("../middlewares/authMiddleware");

router.get("/", verifyRole(["doctor", "patient"]), async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error });
  }
});

router.post("/", verifyRole(["doctor", "patient"]), async (req, res) => {
  try {
    const { userId, message } = req.body;
    const notification = new Notification({ userId, message });
    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.put("/:id/read", verifyRole(["doctor", "patient"]), async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!notification)
      return res.status(404).json({ message: "Notification not found" });
    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
