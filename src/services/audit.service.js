const AuditLog = require('../models/auditLog.model');

/**
 * Log a sensitive action
 * @param {string} userId - ID of the user performing the action
 * @param {string} action - Action description
 * @param {object} req - Express request object for IP and Device info
 * @param {object} details - Additional structured data
 */
const logAction = async (userId, action, req, details = {}) => {
    try {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const device = req.headers['user-agent'];

        await AuditLog.create({
            userId,
            action,
            details,
            ip,
            device
        });
    } catch (err) {
        // We don't want audit logging failure to block business logic
        console.error('Audit Logging Error:', err);
    }
};

module.exports = { logAction };
