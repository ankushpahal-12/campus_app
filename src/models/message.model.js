const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        chatId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat",
            index: true
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        content: String,
        messageType: {
            type: String,
            enum: ["text", "image", "system", "gif", "sticker"],
            default: "text"
        },
        isLiked: { type: Boolean, default: false },
        reaction: { type: String, default: null },
        expiresAt: { type: Date, default: null, index: { expireAfterSeconds: 0 } },
        isDeleted: { type: Boolean, default: false }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
