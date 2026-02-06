const mongoose = require('mongoose');
const { MAX_INTERESTS } = require('../constants/interests');

const profileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    photos: [{ type: String }], // Cloudinary URLs
    bio: { type: String, maxLength: 500 },
    dateOfBirth: Date,
    age: { type: Number, min: 18 },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    university: { type: String, default: 'Your University' },
    major: String,
    graduationYear: Number,
    relationshipGoal: {
        type: String,
        enum: ['Serious Relationship', 'Casual', 'New Friends', 'Not Sure'],
        default: 'Not Sure'
    },
    interests: [{ type: String }],
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
        address: String
    },
    visibility: {
        hideOnlineStatus: { type: Boolean, default: false },
        hideLastSeen: { type: Boolean, default: false },
        hideDistance: { type: Boolean, default: false },
        showAge: { type: Boolean, default: true },
        showLocation: { type: Boolean, default: true },
        showGender: { type: Boolean, default: true },
        isDiscoveryEnabled: { type: Boolean, default: true }
    },
    notificationSettings: {
        matches: { type: Boolean, default: true },
        messages: { type: Boolean, default: true },
        likes: { type: Boolean, default: true }
    },
    chatSettings: {
        vanishingMessages: { type: Boolean, default: false },
        vanishingDuration: { type: Number, default: 24 } // in hours
    }
}, { timestamps: true });

profileSchema.index({ location: '2dsphere' });

profileSchema.set('toJSON', {
    transform: (doc, ret) => {
        const { decrypt } = require('../utils/encryption.util');
        if (ret.photos && ret.photos.length > 0) {
            ret.photos = ret.photos.map(p => decrypt(p));
        }
        // If userId is populated, User model's toJSON will handle its profilePhoto
        return ret;
    }
});

module.exports = mongoose.model('Profile', profileSchema);
