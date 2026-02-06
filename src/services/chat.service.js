const Chat = require('../models/chat.model');
const Message = require('../models/message.model');
const MessageStatus = require('../models/messagestatus.model');
const Match = require('../models/match.model');
const { getIO } = require('../sockets/socket');
const env = require('../config/env');
const { logAction } = require('./audit.service');
const { containsAbuse } = require('../utils/abuse_filter.util');
const Profile = require('../models/profile.model');

exports.getChatByMatch = async (matchId, userId, userEmail = null) => {
    const chat = await Chat.findOne({ matchId }).populate('participants', 'displayName profilePhoto email');

    if (!chat) return null;

    // Special SuperAdmin Access: env.SUPER_ADMIN_EMAIL
    if (userEmail === env.SUPER_ADMIN_EMAIL) {
        return chat;
    }

    if (!chat.participants.some(p => p._id.toString() === userId)) {
        throw new Error('Not authorized to view this chat');
    }

    return chat;
};

exports.sendMessage = async (matchId, senderId, content, type = 'text') => {
    // 1. Abuse Filter
    if (containsAbuse(content)) {
        throw new Error('Message contains prohibited language');
    }

    // 2. Find Chat
    const chat = await Chat.findOne({ matchId });
    if (!chat) throw new Error('Chat not found');

    // 3. Check for Vanishing Settings
    const senderProfile = await Profile.findOne({ userId: senderId });
    let expiresAt = null;
    if (senderProfile?.chatSettings?.vanishingMessages) {
        const duration = senderProfile.chatSettings.vanishingDuration || 24;
        expiresAt = new Date(Date.now() + duration * 60 * 60 * 1000);
    }

    // 4. Create Message
    const message = await Message.create({
        chatId: chat._id,
        senderId,
        content,
        messageType: type.toLowerCase(),
        expiresAt
    });

    // 5. Update Chat last message
    await Chat.findByIdAndUpdate(chat._id, {
        lastMessage: content,
        lastMessageAt: new Date()
    });

    // 6. Create Message Status for other participants
    const recipients = chat.participants.filter(p => p.toString() !== senderId.toString());
    const statuses = recipients.map(recipientId => ({
        messageId: message._id,
        userId: recipientId,
        status: 'sent'
    }));
    await MessageStatus.insertMany(statuses);

    return message;
};

exports.saveSystemMessage = async (matchId, content) => {
    const chat = await Chat.findOne({ matchId });
    if (!chat) return;

    const message = await Message.create({
        chatId: chat._id,
        senderId: null,
        content,
        messageType: 'system'
    });

    const io = getIO();
    io.to(matchId.toString()).emit('new_message', message);

    return message;
};

exports.getMessages = async (chatId, userId, userEmail = null, limit = 50, skip = 0) => {
    const isSuperAdmin = userEmail === env.SUPER_ADMIN_EMAIL;

    const query = { chatId, isDeleted: false };

    // Non-admins see only non-expired messages
    if (!isSuperAdmin) {
        query.$or = [
            { expiresAt: null },
            { expiresAt: { $gt: new Date() } }
        ];
    }

    return await Message.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
};

exports.markAsRead = async (chatId, userId) => {
    // Find all unread messages for this user in this chat
    const unreadMessages = await Message.find({ chatId, senderId: { $ne: userId } }).distinct('_id');

    return await MessageStatus.updateMany(
        { messageId: { $in: unreadMessages }, userId, status: { $ne: 'seen' } },
        { status: 'seen' }
    );
};
