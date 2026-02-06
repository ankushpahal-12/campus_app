const User = require('../models/user.model');
const userService = require('../services/user.service');
const { maskUserResponse } = require('../middlewares/security.middleware');

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json(maskUserResponse(user));
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateMe = async (req, res) => {
    try {
        const { displayName, bio, profilePhoto } = req.body;
        const user = await User.findById(req.user.id);

        if (displayName) user.displayName = displayName;
        if (bio) user.bio = bio;
        if (profilePhoto) user.profilePhoto = profilePhoto;

        await user.save();
        res.json(maskUserResponse(user));
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.deleteAccount = async (req, res) => {
    try {
        const { reason } = req.body;
        await userService.scheduleAccountDeletion(req.user.id, reason, req);
        res.json({ message: 'Account scheduled for deletion in 30 days.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deactivateAccount = async (req, res) => {
    try {
        const { days } = req.body;
        await userService.deactivateAccount(req.user.id, days, req);
        res.json({ message: 'Account deactivated successfully.' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.restoreAccount = async (req, res) => {
    try {
        await userService.restoreUser(req.user.id, req);
        res.json({ message: 'Account restored successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        const { userId, role } = req.body;
        const env = require('../config/env');

        // Only SuperAdmin can promote to ADMIN
        if (req.user.email !== env.SUPER_ADMIN_EMAIL) {
            return res.status(403).json({ message: 'Only SuperAdmin can manage administrative roles.' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.role = role;
        await user.save();

        res.json({ message: `User role updated to ${role}`, user });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
