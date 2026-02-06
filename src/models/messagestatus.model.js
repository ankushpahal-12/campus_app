const mongoose = require('mongoose');

const messageStatusSchema = new mongoose.Schema(
    {
        messageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
            index: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        status: {
            type: String,
            enum: ["sent", "delivered", "seen"]
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("MessageStatus", messageStatusSchema);
