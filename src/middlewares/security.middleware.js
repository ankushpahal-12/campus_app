const { maskData } = require('../services/privacy.service');

/**
 * Harden session security by checking for IP/UA changes
 * If changes are radical, we might flag the session or require re-auth
 */
exports.hardenSession = (req, res, next) => {
    if (req.user && req.user.security) {
        const currentIp = req.ip;
        const currentUa = req.get('User-Agent');

        // Basic check: Log for audit if IP changes within the same session
        // In more advanced scenarios, we'd revoke tokens or trigger MFA
        if (req.user.security.lastLoginIp && req.user.security.lastLoginIp !== currentIp) {
            console.warn(`[Security] IP change detected for user ${req.user._id}: ${req.user.security.lastLoginIp} -> ${currentIp}`);
        }
    }
    next();
};

/**
 * Global Response Masking (Post-processing)
 * Usually implemented via an interceptor or by manually calling the privacy service in controllers
 * For simplicity, we define a helper that controllers can use.
 */
exports.maskUserResponse = (user) => {
    if (!user) return user;
    const userObj = user.toObject ? user.toObject() : { ...user };

    // Mask sensitive fields if they exist
    if (userObj.email) userObj.email = maskData(userObj.email, 'email');
    if (userObj.phone) userObj.phone = maskData(userObj.phone, 'phone');

    // Remove internal security metadata
    delete userObj.security;
    delete userObj.passwordHash;

    return userObj;
};
