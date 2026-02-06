const geoip = require('geoip-lite');
const useragent = require('useragent');
const User = require('../models/user.model');
const mailService = require('./mail.service');
const DeviceSession = require('../models/deviceSession.model');

// Note: geoip-lite uses a local database for lookups.
// It might return null for local or unlisted IPs.

exports.logDevice = async (userId, req) => {
    try {
        const agent = useragent.parse(req.headers['user-agent']);
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const deviceId = req.body.deviceId || 'unknown-device';

        // Check if this is a new device for the user
        const existingSession = await DeviceSession.findOne({ userId, deviceId });
        const isNewDevice = !existingSession;

        // Real Geo Logic using geoip-lite
        const lookup = geoip.lookup(ip);
        const geo = {
            city: lookup ? lookup.city : 'Unknown',
            country: lookup ? lookup.country : 'Unknown',
            region: lookup ? lookup.region : 'Unknown',
            timezone: lookup ? lookup.timezone : 'UTC'
        };

        await DeviceSession.findOneAndUpdate(
            { userId, deviceId },
            {
                ipAddress: ip,
                geo,
                deviceType: agent.device.toString(),
                os: agent.os.toString(),
                browser: agent.toAgent(),
                appVersion: req.headers['x-app-version'] || '1.0.0',
                lastActive: Date.now(),
                isActive: true
            },
            { upsert: true, new: true }
        );

        // If it's a new device, send an email alert
        if (isNewDevice) {
            const user = await User.findById(userId);
            if (user) {
                const deviceDetails = `
                    <b>Device:</b> ${agent.device.toString()}<br/>
                    <b>OS:</b> ${agent.os.toString()}<br/>
                    <b>Browser:</b> ${agent.toAgent()}<br/>
                    <b>IP:</b> ${ip}
                `;
                mailService.sendNewDeviceLoginEmail(user.email, user.displayName, deviceDetails).catch(err => {
                    console.error("Failed to send new device login email:", err);
                });
            }
        }
    } catch (error) {
        console.error('Error logging device:', error);
    }
};

exports.revokeSession = async (sessionId, revokedBy = null) => {
    await DeviceSession.findByIdAndUpdate(sessionId, {
        isActive: false,
        revokedBy: revokedBy
    });
};

exports.getUserSessions = async (userId) => {
    return await DeviceSession.find({ userId, isActive: true });
};
