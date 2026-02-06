const { filterProfileData } = require('../services/privacy.service');
const profileService = require('../services/profile.service');
const Match = require('../models/match.model');
const { logAction } = require('../services/audit.service');

exports.getProfile = async (req, res) => {
    try {
        const profile = await profileService.getProfile(req.params.userId || req.user.id);
        if (!profile) return res.status(404).json({ message: 'Profile not found' });

        const isOwner = req.params.userId ? req.params.userId === req.user.id : true;

        let isMatch = false;
        if (!isOwner) {
            const match = await Match.findOne({
                $or: [
                    { user1Id: req.user.id, user2Id: req.params.userId },
                    { user1Id: req.params.userId, user2Id: req.user.id }
                ],
                isActive: true
            });
            isMatch = !!match;
        }

        const filteredProfile = filterProfileData(profile, isOwner, isMatch);

        res.json(filteredProfile);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const profile = await profileService.updateProfile(req.user.id, req.body);
        await logAction(req.user.id, 'PROFILE_UPDATE', req);
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getPreferences = async (req, res) => {
    try {
        const preferences = await profileService.getPreferences(req.user.id);
        res.json(preferences);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updatePreferences = async (req, res) => {
    try {
        const preferences = await profileService.updatePreferences(req.user.id, req.body);
        res.json(preferences);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.uploadPhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const profile = await profileService.uploadPhoto(req.user.id, req.file.path);

        await logAction(req.user.id, 'PHOTO_UPLOAD', req);

        res.json({
            message: 'Photo uploaded successfully',
            photoUrl: req.file.path,
            photos: profile.photos
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deletePhoto = async (req, res) => {
    try {
        const { photoUrl } = req.body;
        if (!photoUrl) return res.status(400).json({ message: 'Photo URL is required' });

        const profile = await profileService.deletePhoto(req.user.id, photoUrl);
        await logAction(req.user.id, 'PHOTO_DELETE', req);

        res.json({ message: 'Photo deleted successfully', photos: profile.photos });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.setPrimaryPhoto = async (req, res) => {
    try {
        const { photoUrl } = req.body;
        if (!photoUrl) return res.status(400).json({ message: 'Photo URL is required' });

        await profileService.setPrimaryPhoto(req.user.id, photoUrl);
        await logAction(req.user.id, 'PHOTO_PRIMARY_SET', req);

        res.json({ message: 'Primary photo updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
