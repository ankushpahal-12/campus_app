const mongoose = require('mongoose');

const swipeSchema = new mongoose.Schema(
    {
        fromUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            index: true
        },
        toUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            index: true
        },
        type: {
            type: String,
            enum: ["like", "dislike", "superlike"],
            required: true
        }
    },
    { timestamps: true }
);

swipeSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

module.exports = mongoose.model("Swipe", swipeSchema);
