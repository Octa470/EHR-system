const express = require("express");
const router = express.Router();
const MedicalRecord = require("../models/MedicalRecord");
const { verifyRole } = require("../middlewares/authMiddleware");

router.post("/add", verifyRole(["doctor"]), async (req, res) => {
  try {
    const {
      patientId,
      heartRate,
      bloodPressure,
      bloodSugarLevel,
      medicalCondition,
      prescribedMedications,
      notes,
    } = req.body;

    const record = new MedicalRecord({
      patient: patientId,
      doctor: req.user._id,
      heartRate,
      bloodPressure,
      bloodSugarLevel,
      medicalCondition,
      prescribedMedications,
      notes,
    });

    await record.save();

    res.json({ message: "Medical record added successfully", record });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
});

router.get("/my-records", verifyRole(["patient"]), async (req, res) => {
  try {
    const records = await MedicalRecord.find({
      patient: req.user._id,
    })
      .populate("patient", "name email")
      .populate("doctor", "name email");

    res.json(records);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
});

router.get("/:patientId", verifyRole(["doctor"]), async (req, res) => {
  try {
    const records = await MedicalRecord.find({
      patient: req.params.patientId,
      doctor: req.user._id,
    })
      .populate("patient", "name email")
      .populate("doctor", "name email");

    res.json(records);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
});

module.exports = router;
