const matchService = require('../services/match.service');
const { logAction } = require('../services/audit.service');

exports.handleSwipe = async (req, res) => {
    try {
        const { swipedId, type } = req.body;
        const result = await matchService.handleSwipe(req.user.id, swipedId, type);

        await logAction(req.user.id, `SWIPE_${type}`, req, { swipedId });

        if (result.match) {
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
