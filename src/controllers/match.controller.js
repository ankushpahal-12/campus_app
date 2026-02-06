const { filterProfileData } = require('../services/privacy.service');
const matchService = require('../services/match.service');
const { logAction } = require('../services/audit.service');
const socket = require('../sockets/socket');

exports.getDiscovery = async (req, res) => {
    try {
        const users = await matchService.getDiscoveryUsers(req.user.id);
        const filteredUsers = users.map(user => filterProfileData(user.profile, false, false));
        res.json(filteredUsers);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

exports.swipe = async (req, res) => {
    try {
        const { swipedId, type } = req.body;
        const result = await matchService.handleSwipe(req.user.id, swipedId, type);

        await logAction(req.user.id, `SWIPE_${type}`, req, { swipedId });

        if (result.match) {
            const io = socket.getIO();
            // Notify both users
            io.to(req.user.id.toString()).emit('match_found', { matchId: result.matchId, matchedWith: swipedId });
            io.to(swipedId.toString()).emit('match_found', { matchId: result.matchId, matchedWith: req.user.id });

            return res.json({ message: "It's a Match!", match: true, matchId: result.matchId });
        }

        res.json({ message: 'Swipe recorded', match: false });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'User already swiped on' });
        }
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getMatches = async (req, res) => {
    try {
        const Match = require('../models/match.model');
        const matches = await Match.find({
            $or: [
                { user1Id: req.user.id },
                { user2Id: req.user.id }
            ],
            isActive: true
        })
            .populate('user1Id', 'displayName profilePhoto bio')
            .populate('user2Id', 'displayName profilePhoto bio');

        res.json(matches);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
