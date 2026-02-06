const visibilityService = require('../services/visibility.service');

exports.updateVisibility = async (req, res) => {
    try {
        const visibility = await visibilityService.updateVisibility(req.user.id, req.body);
        res.json({ message: 'Visibility settings updated', visibility: visibility.visibility });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getVisibility = async (req, res) => {
    try {
        const visibility = await visibilityService.getVisibility(req.user.id);
        if (!visibility) return res.status(404).json({ message: 'Settings not found' });
        res.json({ visibility }); // Wrap in object for consistency
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getNotificationSettings = async (req, res) => {
    try {
        const settings = await visibilityService.getNotificationSettings(req.user.id);
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateNotificationSettings = async (req, res) => {
    try {
        const settings = await visibilityService.updateNotificationSettings(req.user.id, req.body);
        res.json({ message: 'Notification settings updated', notificationSettings: settings.notificationSettings });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
