const matchService = require('../services/match.service');

exports.getDiscovery = async (req, res) => {
    try {
        const users = await matchService.getDiscoveryUsers(req.user.id);
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};
