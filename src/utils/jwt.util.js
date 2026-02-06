const jwt = require('jsonwebtoken');
const secrets = require('../config/secrets');

/**
 * Generate Access Token (Short-lived)
 */
exports.generateAccessToken = (userId) => {
    return jwt.sign({ id: userId }, secrets.jwtSecret, {
        expiresIn: '15m'
    });
};

/**
 * Generate Refresh Token (Long-lived)
 */
exports.generateRefreshToken = (userId) => {
    return jwt.sign({ id: userId }, secrets.jwtRefreshSecret, {
        expiresIn: '7d'
    });
};

/**
 * Verify Token
 */
exports.verifyToken = (token, isRefresh = false) => {
    const secret = isRefresh ? secrets.jwtRefreshSecret : secrets.jwtSecret;
    return jwt.verify(token, secret);
};
