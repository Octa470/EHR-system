const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  heartRate: { type: Number },
  bloodPressure: { type: String },
  bloodSugarLevel: { type: Number },
  medicalCondition: { type: String, required: true },
  prescribedMedications: [{ type: String }],
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("MedicalRecord", medicalRecordSchema);
