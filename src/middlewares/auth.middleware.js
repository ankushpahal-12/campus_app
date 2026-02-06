const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { getClient } = require('../config/redis');
const env = require('../config/env');

exports.protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const { verifyToken } = require('../utils/jwt.util');
            const decoded = verifyToken(token);

            // Check if token is blacklisted
            const redisClient = getClient();
            const isBlacklisted = await redisClient.get(`blacklist:${token}`);
            if (isBlacklisted) {
                return res.status(401).json({ message: 'Token revoked. Please login again.' });
            }

            req.user = await User.findById(decoded.id).select('-passwordHash');

            // Hardcoded SuperAdmin override
            if (req.user && req.user.email === env.SUPER_ADMIN_EMAIL) {
                req.user.role = 'ADMIN'; // Ensure role is ADMIN for this specific user
                req.user.isSuperAdmin = true;
            }

            next();
        } catch (error) {
            console.error(error);
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expired', code: 'TOKEN_EXPIRED' });
            }
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};