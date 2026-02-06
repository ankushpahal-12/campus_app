const mongoose = require('mongoose');

const screenshotLogSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        screenType: { type: String, enum: ["profile", "chat"] },
        deviceId: String,
        ipAddress: String
    },
    { timestamps: true }
);

module.exports = mongoose.model("ScreenshotLog", screenshotLogSchema);
