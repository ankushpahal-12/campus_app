const Swipe = require('../models/swipe.model');
const Match = require('../models/match.model');
const Profile = require('../models/profile.model');
const Preference = require('../models/preference.model');
const notificationService = require('./notification.service');
const chatService = require('./chat.service');
const { getClient } = require('../config/redis');

/**
 * Perform a swipe and check for match
 */
exports.handleSwipe = async (swiperId, swipedId, type) => {
    // 1. Create Swipe
    const swipe = await Swipe.create({ fromUserId: swiperId, toUserId: swipedId, type: type.toLowerCase() });

    // 2. Notify target user of Like
    if (type.toLowerCase() === 'like' || type.toLowerCase() === 'superlike') {
        await notificationService.createNotification(
            swipedId,
            'LIKED_YOU',
            'Someone just liked your profile!',
            { fromUserId: swiperId }
        );

        // 3. Check for mutual like
        const mutualSwipe = await Swipe.findOne({
            fromUserId: swipedId,
            toUserId: swiperId,
            type: { $in: ['like', 'superlike'] }
        });

        if (mutualSwipe) {
            // It's a match!
            const [u1, u2] = [swiperId, swipedId].sort();
            const match = await Match.create({
                user1Id: u1,
                user2Id: u2
            });

            // Automated "Hii" message for production feel
            try {
                // We assume getChatByMatch or sendMessage handles chat creation if needed
                // Based on existing chatService, sendMessage handles it if chatId is found via matchId
                // But we first need to ensure a Chat document exists for this matchId
                const Chat = require('../models/chat.model');
                let chat = await Chat.findOne({ matchId: match._id });
                if (!chat) {
                    chat = await Chat.create({
                        matchId: match._id,
                        participants: [u1, u2],
                        lastMessage: "Hii 👋",
                        lastMessageAt: new Date()
                    });
                }
                await chatService.sendMessage(match._id, swiperId, "Hii 👋", "text");
            } catch (chatError) {
                console.error("Error creating auto-chat/message:", chatError);
            }

            return { match: true, matchId: match._id };
        }
    }

    return { match: false };
};

/**
 * Get potential discovery users based on preferences and distance
 */
exports.getDiscoveryUsers = async (userId) => {
    const profile = await Profile.findOne({ userId });
    const prefs = await Preference.findOne({ userId });

    if (!profile || !prefs) throw new Error('Profile or Preferences not found');

    // Find users who match criteria and haven't been swiped on yet
    const swipedIds = await Swipe.find({ fromUserId: userId }).distinct('toUserId');
    swipedIds.push(userId); // Exclude self

    const query = {
        userId: { $nin: swipedIds },
        age: { $gte: prefs.minAge, $lte: prefs.maxAge },
        'visibility.isDiscoveryEnabled': { $ne: false }, // Respect discovery toggle
        'location.coordinates': { $exists: true, $ne: [0, 0] } // Ensure user has location
    };

    if (prefs.interestedIn !== 'all') {
        query.gender = prefs.interestedIn;
    }

    return await Profile.find({
        ...query,
        location: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: profile.location.coordinates
                },
                $maxDistance: prefs.maxDistance * 1000 // converts km to meters
            }
        }
    }).limit(20);
};
