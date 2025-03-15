const mongoose = require("mongoose");

const billingSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  services: [
    {
      description: String,
      cost: Number,
    },
  ],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ["pending", "paid"], default: "pending" },
  issuedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Billing", billingSchema);
