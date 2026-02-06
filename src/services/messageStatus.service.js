const MessageStatus = require('../models/messagestatus.model');

/**
 * Update delivered status for a message
 */
exports.markAsDelivered = async (messageId, userId) => {
    return await MessageStatus.findOneAndUpdate(
        { messageId, recipientId: userId },
        { status: 'DELIVERED', deliveredAt: new Date() },
        { upsert: true, new: true }
    );
};

/**
 * Update read status for a message
 */
exports.markAsRead = async (messageId, userId) => {
    return await MessageStatus.findOneAndUpdate(
        { messageId, recipientId: userId },
        { status: 'READ', readAt: new Date() },
        { upsert: true, new: true }
    );
};
