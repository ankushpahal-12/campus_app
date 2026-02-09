const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { encrypt, decrypt } = require('../utils/encryption.util');

const userSchema = new mongoose.Schema(
  {
    displayName: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      lowercase: true,
      index: true
    },

    passwordHash: { type: String, required: true },

    profilePhoto: String,
    bio: String,
    age: Number,
    gender: { type: String, enum: ["male", "female", "other"] },
    interests: [String],

    location: {
      city: String,
      country: String,
      lat: Number,
      lng: Number
    },

    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    isRestricted: { type: Boolean, default: false },

    deactivation: {
      deactivatedUntil: Date,
      lastDeactivatedAt: Date
    },

    visibility: {
      hideOnlineStatus: { type: Boolean, default: false },
      hideLastSeen: { type: Boolean, default: false },
      hideDistance: { type: Boolean, default: false },
      readReceiptsEnabled: { type: Boolean, default: true },
      typingIndicatorEnabled: { type: Boolean, default: true }
    },

    security: {
      lastLoginAt: Date,
      lastLoginIp: String,
      failedLoginAttempts: { type: Number, default: 0 },
      accountLockedUntil: Date
    },

    role: {
      type: String,
      enum: ["USER", "MODERATOR", "ADMIN", "SUPER_ADMIN"],
      default: "USER"
    },

    lastSeen: Date
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return;
  this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

// Remove password and decrypt photos from JSON output
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.passwordHash;
  if (user.profilePhoto) {
    user.profilePhoto = decrypt(user.profilePhoto);
  }
  return user;
};

module.exports = mongoose.model("User", userSchema);