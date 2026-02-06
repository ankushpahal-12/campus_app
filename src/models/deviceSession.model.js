const mongoose = require('mongoose');

const deviceSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true
    },

    deviceId: { type: String, required: true },
    deviceType: String,
    deviceName: String,
    os: String,
    appVersion: String,

    ipAddress: String,
    fingerprint: { type: String, index: true }, // Hardware-level unique ID
    brand: String,      // e.g. Samsung, Apple
    modelName: String,  // e.g. SM-G991B, iPhone 13
    osVersion: String,  // e.g. Android 12, iOS 15.1
    location: {
        city: String,
        country: String
    },

    isTrusted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    lastLoginAt: { type: Date, default: Date.now }
},
    { timestamps: true }
);

deviceSessionSchema.index({ userId: 1, deviceId: 1 }, { unique: true });

module.exports = mongoose.model("DeviceSession", deviceSessionSchema);
