const blockService = require('../services/block.service');
const { logAction } = require('../services/audit.service');

exports.blockUser = async (req, res) => {
    try {
        const { blockId } = req.body;
        await blockService.blockUser(req.user.id, blockId);
        await logAction(req.user.id, 'USER_BLOCK', req, { blockedId: blockId });
        res.json({ message: 'User blocked successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.unblockUser = async (req, res) => {
    try {
        const { blockId } = req.body;
        await blockService.unblockUser(req.user.id, blockId);
        res.json({ message: 'User unblocked successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getBlockedUsers = async (req, res) => {
    try {
        const users = await blockService.getBlockedUsers(req.user.id);
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
