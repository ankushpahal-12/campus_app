const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
    {
        user1Id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        user2Id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        matchedAt: { type: Date, default: Date.now },
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

matchSchema.index({ user1Id: 1, user2Id: 1 }, { unique: true });

module.exports = mongoose.model("Match", matchSchema);
