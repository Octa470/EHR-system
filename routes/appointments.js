const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const Notification = require("../models/Notification");
const { verifyRole } = require("../middlewares/authMiddleware");

router.post("/book", verifyRole(["patient", "doctor"]), async (req, res) => {
  try {
    const { date, time } = req.body;
    let { doctorId, patientId } = req.body;
    const userRole = req.user.role;
    const userId = req.user._id;

    if (userRole === "patient") {
      patientId = userId;
      if (!doctorId) {
        return res.status(400).json({ error: "Doctor ID is required." });
      }
    } else if (userRole === "doctor") {
      doctorId = userId;
      if (!patientId) {
        return res.status(400).json({ error: "Patient ID is required." });
      }
    }

    if (!date || !time) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      date,
      time,
      status: "Pending",
      initiatedBy: userRole,
    });

    // Populate the newly created appointment with patient and doctor info
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("patientId", "name email")
      .populate("doctorId", "name email");

    const recipientId = userRole === "patient" ? doctorId : patientId;
    const initiator = userRole === "patient" ? "patient" : "doctor";

    await Notification.create({
      userId: recipientId,
      message: `New appointment request from ${initiator} for ${date} at ${time}.`,
    });

    res
      .status(201)
      .json({
        message: "Appointment requested successfully.",
        appointment: populatedAppointment,
      });
  } catch (error) {
    res.status(500).json({ error: "Server Error.", message: error.message });
  }
});

router.put(
  "/:id/status",
  verifyRole(["doctor", "patient"]),
  async (req, res) => {
    try {
      const { status } = req.body;
      const userRole = req.user.role;

      if (!status) {
        return res.status(400).json({ error: "Status is required." });
      }

      const doctorAllowedStatuses = ["Confirmed", "Cancelled", "Completed"];
      const patientAllowedStatuses = ["Cancelled"];

      const allowedStatuses =
        userRole === "doctor" ? doctorAllowedStatuses : patientAllowedStatuses;

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          error: `Invalid status. ${userRole} can only set status to: ${allowedStatuses.join(
            ", "
          )}.`,
        });
      }

      const appointment = await Appointment.findById(req.params.id);
      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found." });
      }

      const relevantId = userRole === "doctor" ? "doctorId" : "patientId";
      if (appointment[relevantId].toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ error: "Not authorized to update this appointment." });
      }

      appointment.status = status;
      await appointment.save();

      const recipientId =
        userRole === "doctor" ? appointment.patientId : appointment.doctorId;
      const actor = userRole === "doctor" ? "doctor" : "patient";

      await Notification.create({
        userId: recipientId,
        message: `Your appointment has been ${status.toLowerCase()} by the ${actor}.`,
      });

      res
        .status(200)
        .json({ message: `Appointment ${status.toLowerCase()} successfully.` });
    } catch (error) {
      res.status(500).json({ error: "Server Error.", message: error.message });
    }
  }
);

router.get("/", verifyRole(["patient", "doctor"]), async (req, res) => {
  try {
    let filter =
      req.user.role === "patient"
        ? { patientId: req.user._id }
        : { doctorId: req.user._id };

    const appointments = await Appointment.find(filter)
      .sort({ date: 1, time: 1 })
      .populate("patientId", "name email")
      .populate("doctorId", "name email");

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ error: "Server Error.", message: error.message });
  }
});

module.exports = router;
