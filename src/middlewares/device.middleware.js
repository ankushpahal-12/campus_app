const DeviceSession = require('../models/deviceSession.model');

/**
 * Check if the current device session is revoked
 */
exports.checkDeviceStatus = async (req, res, next) => {
    try {
        const deviceId = req.headers['x-device-id'];
        if (!deviceId) return next(); // Some clients might not send it yet
        if (!req.user) return next(); // Not authenticated yet (e.g. login route)


        const session = await DeviceSession.findOne({
            userId: req.user.id,
            deviceId
        });


        if (session && session.isRevoked) {
            return res.status(401).json({
                success: false,
                message: 'This device session has been revoked. Please log in again.'
            });
        }

        next();
    } catch (error) {
        next(error);
    }
};
