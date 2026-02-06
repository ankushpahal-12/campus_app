const userService = require('../services/user.service');

exports.deleteAccount = async (req, res) => {
    try {
        await userService.scheduleAccountDeletion(req.user.id, req.body.reason || 'User Request', req);
        res.json({ message: 'Account deletion scheduled for 30 days.' });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

exports.deactivateAccount = async (req, res) => {
    try {
        await userService.deactivateAccount(req.user.id, req.body.days || 'until_login', req);
        res.json({ message: 'Account deactivated successfully.' });
    } catch (error) {
        res.status(400).json({ message: error.message || 'Server Error' });
    }
};

exports.reactivateAccount = async (req, res) => {
    try {
        await userService.requestRestoration(req.user.id, req);
        res.json({ message: 'Restoration request sent to admin.' });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

exports.getDeletionStatus = async (req, res) => {
    try {
        const status = await userService.getDeletionStatus(req.user.id);
        if (!status) return res.status(404).json({ message: 'No deletion schedule found' });
        res.json(status);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};
