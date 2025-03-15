const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { verifyRole } = require("../middlewares/authMiddleware");
const Notification = require("../models/Notification");

router.post("/choose-doctor", verifyRole(["patient"]), async (req, res) => {
  try {
    const { doctorID } = req.body;
    const patientId = req.user._id;
    const mongoose = require("mongoose");

    if (!mongoose.Types.ObjectId.isValid(doctorID)) {
      return res.status(400).json({ error: "Invalid Doctor ID format" });
    }

    const doctorObjectId = new mongoose.Types.ObjectId(doctorID.trim());

    const doctor = await User.findOne({ _id: doctorObjectId, role: "doctor" });
    if (!doctor) return res.status(404).json({ error: "Doctor Not Found." });

    doctor.patients = doctor.patients || [];

    if (doctor.patients.includes(patientId)) {
      console.log("Patient already linked to this doctor, updating doctor field...");

      const updatedPatient = await User.findByIdAndUpdate(
        patientId,
        { $set: { doctor: doctorObjectId } },
        { new: true }
      );
    
      return res.json({ message: "Doctor updated for patient.", doctor, patient: updatedPatient });
    }
    

    doctor.patients.push(patientId);
    await doctor.save();

    const updatedPatient = await User.findByIdAndUpdate(
      patientId,
      { $set: { doctor: doctorObjectId } },
      { new: true }
    );

    if (!updatedPatient) {
      console.log("Patient Not Found in DB");
      return res.status(404).json({ error: "Patient Not Found." });
    }

    try {
      await Notification.create({
        userId: doctor._id,
        message: `You have been assigned a new patient: ${updatedPatient.name}.`,
      });

      await Notification.create({
        userId: patientId,
        message: `Your doctor selection is confirmed: Dr. ${doctor.name}.`,
      });
    } catch (notifError) {
      console.error("Notification error:", notifError.message);
    }

    res.json({ message: "Patient linked successfully.", doctor, patient: updatedPatient });
  } catch (error) {
    console.error("rror updating doctor:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});


module.exports = router;
