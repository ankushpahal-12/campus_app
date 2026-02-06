const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['GIF', 'STICKER', 'HASHTAG'],
        required: true,
        index: true
    },
    value: {
        type: String,
        required: true
    }, // URL for GIFs/Stickers, text for Hashtags
    category: {
        type: String,
        required: true,
        index: true
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isAdminAuthored: {
        type: Boolean,
        default: false
    },
    usageCount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Ensure unique hashtags and unique URLs for stickers/gifs per user
contentSchema.index({ type: 1, value: 1 }, { unique: true });

module.exports = mongoose.model('Content', contentSchema);
