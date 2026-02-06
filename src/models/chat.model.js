const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
    {
        matchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Match",
            unique: true
        },
        participants: [
            { type: mongoose.Schema.Types.ObjectId, ref: "User" }
        ],
        lastMessage: String,
        lastMessageAt: Date
    },
    { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);
