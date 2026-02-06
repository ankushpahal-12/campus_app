const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const { getClient } = require('../config/redis');
const env = require('../config/env');
const mailService = require('./mail.service');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt.util');

const generateTokens = async (userId) => {
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);

    // Store refresh token in Redis with 7 days expiry
    const redisClient = getClient();
    await redisClient.set(`refresh:${userId}:${refreshToken}`, '1', { EX: 7 * 24 * 60 * 60 });

    return { accessToken, refreshToken };
};

exports.requestOTP = async (email) => {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const redisClient = getClient();

    // Store OTP in Redis for 10 minutes
    await redisClient.set(`otp:${email}`, otp, { EX: 600 });

    // Send OTP via email
    await mailService.sendOTPEmail(email, otp);
    return otp;
};

exports.resendOTP = async (email) => {
    // We can reuse requestOTP or add specific logic like rate limiting here
    return await exports.requestOTP(email);
};

exports.verifyOTP = async (email, otp, req) => {
    const redisClient = getClient();
    const storedOtp = await redisClient.get(`otp:${email}`);

    if (!storedOtp || storedOtp !== otp) {
        throw new Error('Invalid or expired OTP');
    }

    // Clear OTP after successful verification
    await redisClient.del(`otp:${email}`);

    const user = await User.findOne({ email });
    if (!user) {
        return { isNewUser: true };
    }

    const tokens = await generateTokens(user._id);

    return {
        isNewUser: false,
        user: {
            id: user._id,
            email: user.email,
            displayName: user.displayName
        },
        ...tokens
    };
};

exports.loginUser = async (email, password, req) => {
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !(await user.comparePassword(password))) {
        throw new Error('Invalid email or password');
    }

    if (user.isDeleted) {
        // Allow login for restoration within 30 days
        // We'll return an isDeleted flag so the frontend can show restoration UI
    }

    const tokens = await generateTokens(user._id);

    // Update security metadata
    if (req) {
        user.security.lastLoginIp = req.ip;
        user.security.lastLoginAt = new Date();

        // Auto-reactivate if deactivated
        if (!user.isActive) {
            user.isActive = true;
            user.deactivation.deactivatedUntil = null;
        }

        await user.save();
    }

    return {
        user: {
            id: user._id,
            email: user.email,
            displayName: user.displayName,
            profilePhoto: user.profilePhoto,
            isVerified: user.isVerified,
            isDeleted: user.isDeleted,
            isAdmin: user.email === env.SUPER_ADMIN_EMAIL
        },
        ...tokens
    };
};

exports.refreshAccessToken = async (refreshToken) => {
    if (!refreshToken) throw new Error('No refresh token provided');

    try {
        const { verifyToken } = require('../utils/jwt.util');
        const decoded = verifyToken(refreshToken, true);
        const redisClient = getClient();

        // Check if token exists in Redis whitelist
        const isValid = await redisClient.get(`refresh:${decoded.id}:${refreshToken}`);
        if (!isValid) throw new Error('Invalid refresh token');

        // Rotate tokens: Delete old, create new pair
        await redisClient.del(`refresh:${decoded.id}:${refreshToken}`);
        const newTokens = await generateTokens(decoded.id);

        return newTokens;
    } catch (error) {
        throw new Error('Invalid or expired refresh token');
    }
};

exports.logoutUser = async (userId, refreshToken, accessToken) => {
    const redisClient = getClient();
    if (refreshToken) {
        await redisClient.del(`refresh:${userId}:${refreshToken}`);
    }
    if (accessToken) {
        // Blacklist access token until it expires
        // We'll set it to expire in 1 hour (matching our JWT access token expiry)
        await redisClient.set(`blacklist:${accessToken}`, '1', { EX: 3600 });
    }
};

exports.changePassword = async (userId, currentPassword, newPassword) => {
    const user = await User.findById(userId).select('+passwordHash');
    if (!user || !(await user.comparePassword(currentPassword))) {
        throw new Error('Current password incorrect');
    }

    user.passwordHash = newPassword;
    await user.save();

    // Send Security Notification
    mailService.sendPasswordChangeEmail(user.email, user.displayName).catch(err => {
        console.error("Failed to send password change email:", err);
    });
};

exports.verifyPassword = async (userId, password) => {
    const user = await User.findById(userId).select('+passwordHash');
    if (!user || !(await user.comparePassword(password))) {
        throw new Error('Verification failed. Invalid password.');
    }
    return true;
};
