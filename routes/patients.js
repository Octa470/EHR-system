const express = require("express");
const User = require("../models/User");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const patients = await User.find({ role: "patient" }).select(
      "name email profilePicture"
    );
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch patients" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const patient = await User.findOne({ _id: req.params.id, role: "patient" });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch patient details" });
  }
});

module.exports = router;
