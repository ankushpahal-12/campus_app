const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
    {
        reporterId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reason: String,
        description: String,
        status: {
            type: String,
            enum: ["pending", "reviewed", "resolved"],
            default: "pending"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
