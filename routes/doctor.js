const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { verifyRole } = require("../middlewares/authMiddleware");

router.get("/patients", verifyRole(["doctor"]), async (req, res) => {
  try {
    const patient = await User.findById(req.user._id).populate("patients");
    res.json({ patient });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;
