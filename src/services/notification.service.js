const Notification = require('../models/notification.model');
const AuditLog = require('../models/auditLog.model');

/**
 * Sends a notification to a specific user and logs the administrative action.
 */
exports.sendNotification = async (userId, title, body, data = {}, adminId = null) => {
    try {
        // 1. Store in Database
        const notification = await Notification.create({
            userId,
            title,
            body,
            data,
            isRead: false
        });

        // 2. If it's an admin action, log it
        if (adminId) {
            await AuditLog.create({
                userId: adminId,
                action: 'ADMIN_SEND_NOTIFICATION',
                details: { targetUserId: userId, notificationId: notification._id, title }
            });
        }

        // 3. Real-time delivery (Socket.io)
        // In a full implementation, we'd emit to the specific user's socket room
        // const io = require('../sockets/chat.socket').getIO();
        // io.to(userId.toString()).emit('new_notification', notification);

        return notification;
    } catch (error) {
        console.error('Error in sendNotification service:', error);
        throw error;
    }
};
