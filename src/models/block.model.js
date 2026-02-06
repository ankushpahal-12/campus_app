const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        blockedUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    },
    { timestamps: true }
);

blockSchema.index({ userId: 1, blockedUserId: 1 }, { unique: true });

module.exports = mongoose.model("Block", blockSchema);
