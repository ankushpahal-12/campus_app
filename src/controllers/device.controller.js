const DeviceSession = require('../models/deviceSession.model');
const useragent = require('useragent');

// Helper to log device on login
exports.logDevice = async (userId, req) => {
    try {
        const agent = useragent.parse(req.headers['user-agent']);
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const deviceId = req.body.deviceId || 'unknown-device';
        const { fingerprint, brand, modelName, osVersion } = req.body;

        // Update if exists, or create new
        await DeviceSession.findOneAndUpdate(
            { userId, deviceId },
            {
                ipAddress: ip,
                fingerprint: fingerprint || 'unknown-fingerprint',
                brand,
                modelName,
                osVersion,
                deviceType: agent.device.toString(),
                os: agent.os.toString(),
                browser: agent.toAgent(),
                lastActive: Date.now(),
                isActive: true
            },
            { upsert: true, new: true }
        );
    } catch (error) {
        console.error('Error logging device:', error);
    }
};

// @desc    Get all active devices for user
// @route   GET /api/devices
// @access  Private
exports.getDevices = async (req, res) => {
    try {
        const devices = await DeviceSession.find({ userId: req.user.id, isActive: true });
        res.json(devices);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Revoke a device session
// @route   DELETE /api/devices/:deviceId
// @access  Private
exports.revokeDevice = async (req, res) => {
    try {
        await DeviceSession.findOneAndUpdate(
            { userId: req.user.id, deviceId: req.params.deviceId },
            { isActive: false }
        );
        res.json({ message: 'Device revoked' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
