const Block = require('../models/block.model');
const Swipe = require('../models/swipe.model');
const Match = require('../models/match.model');

/**
 * Block a user
 */
exports.blockUser = async (userId, blockId) => {
    // 1. Create Block record
    await Block.create({ userId, blockedUserId: blockId });

    // 2. Remove any matches between them
    await Match.updateMany(
        {
            $or: [
                { user1Id: userId, user2Id: blockId },
                { user1Id: blockId, user2Id: userId }
            ]
        },
        { isActive: false }
    );

    // 3. Remove any swipes
    await Swipe.deleteMany({
        $or: [
            { fromUserId: userId, toUserId: blockId },
            { fromUserId: blockId, toUserId: userId }
        ]
    });

    return true;
};

/**
 * Unblock a user
 */
exports.unblockUser = async (userId, blockId) => {
    await Block.deleteOne({ userId, blockedUserId: blockId });
    return true;
};

/**
 * Get blocked users
 */
exports.getBlockedUsers = async (userId) => {
    const blocks = await Block.find({ userId }).populate('blockedUserId', 'displayName profilePhoto');
    return blocks.map(b => b.blockedUserId);
};
