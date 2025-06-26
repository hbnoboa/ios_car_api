const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    confirmed: { type: Boolean, default: false },
    confirmationToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordSentAt: { type: Date },
    name: { type: String },
    role: { type: String, default: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
