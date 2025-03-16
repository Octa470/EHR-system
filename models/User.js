const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

bcrypt.setRandomFallback((len) => {
  const buf = new Uint8Array(len);
  for (let i = 0; i < buf.length; i++) {
    buf[i] = Math.floor(Math.random() * 256);
  }
  return buf;
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["doctor", "patient"], required: true },
  profilePicture: { type: String, default: "" },
  patients: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    default: function () {
      return this.role === "doctor" ? [] : undefined;
    },
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: function () {
      return this.role === "patient" ? null : undefined;
    },
  },
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
