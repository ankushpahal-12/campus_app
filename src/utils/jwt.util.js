const jwt = require('jsonwebtoken');

/**
 * Generate Access Token (Short-lived)
 */
exports.generateAccessToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '15m'
    });
};

/**
 * Generate Refresh Token (Long-lived)
 */
exports.generateRefreshToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
};

/**
 * Verify Token
 */
exports.verifyToken = (token, isRefresh = false) => {
    const secret = isRefresh ? (process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET) : process.env.JWT_SECRET;
    return jwt.verify(token, secret);
};
