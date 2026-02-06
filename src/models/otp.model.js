const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, index: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    isUsed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Otp", otpSchema);