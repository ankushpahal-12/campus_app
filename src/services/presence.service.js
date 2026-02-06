const { getClient } = require('../config/redis');
const User = require('../models/user.model');
const Match = require('../models/match.model');

/**
 * Set user online in Redis and MongoDB
 */
exports.setUserOnline = async (userId, socketId) => {
    const redisClient = getClient();

    // Use a set to track multiple sockets/devices for the same user
    await redisClient.sAdd(`user:online:${userId}`, socketId);

    // Update MongoDB
    await User.findByIdAndUpdate(userId, { isOnline: true });
};

/**
 * Set custom status (online, busy, away, etc)
 */
exports.setStatus = async (userId, status) => {
    const redisClient = getClient();
    await redisClient.set(`user:status:${userId}`, status);

    if (status === 'offline') {
        // Force offline in MongoDB even if sockets are connected
        await User.findByIdAndUpdate(userId, {
            isOnline: false,
            lastActive: Date.now()
        });
    } else {
        await User.findByIdAndUpdate(userId, { isOnline: true });
    }
};

/**
 * Get user status
 */
exports.getStatus = async (userId) => {
    const redisClient = getClient();
    const status = await redisClient.get(`user:status:${userId}`);
    return status || 'online';
}

/**
 * Set user offline / Remove specific socket
 */
exports.setUserOffline = async (userId, socketId) => {
    const redisClient = getClient();
    await redisClient.sRem(`user:online:${userId}`, socketId);

    // Check if user still has other active sockets
    const count = await redisClient.sCard(`user:online:${userId}`);
    if (count === 0) {
        await User.findByIdAndUpdate(userId, {
            isOnline: false,
            lastActive: Date.now()
        });
        return true; // Fully offline
    }
    return false; // Still online on other device
};

/**
 * Check if user is online
 */
exports.isUserOnline = async (userId) => {
    const redisClient = getClient();
    const count = await redisClient.sCard(`user:online:${userId}`);
    return count > 0;
};

/**
 * Get matches for broadcast
 */
exports.getMatchesForBroadcast = async (userId) => {
    const matches = await Match.find({
        users: userId,
        isUnmatched: false
    }).distinct('users');

    return matches.filter(id => id.toString() !== userId.toString());
};
