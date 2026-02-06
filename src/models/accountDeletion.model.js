const mongoose = require('mongoose');

const accountDeletionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            unique: true
        },
        reason: String,
        requestedAt: { type: Date, default: Date.now },
        scheduledFor: { type: Date, required: true },
        processedAt: Date,
        restorationRequested: { type: Boolean, default: false },
        restorationRequestedAt: Date,
        restorationAttempts: { type: Number, default: 0 }
    }
);

module.exports = mongoose.model("AccountDeletion", accountDeletionSchema);
