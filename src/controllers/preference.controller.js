const profileService = require('../services/profile.service');

exports.updatePreferences = async (req, res) => {
    try {
        const preferences = await profileService.updatePreferences(req.user.id, req.body);
        res.json({ message: 'Discovery preferences updated', preferences });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getPreferences = async (req, res) => {
    try {
        const preferences = await profileService.getPreferences(req.user.id);
        if (!preferences) return res.status(404).json({ message: 'Preferences not found' });
        res.json(preferences);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
