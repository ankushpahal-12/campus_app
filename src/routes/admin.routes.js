const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { updateUserRole } = require('../controllers/user.controller');
const { authorize, isSuperAdmin } = require('../middlewares/admin.middleware');
const adminController = require('../controllers/admin.controller');

// Restricted to ADMINs
router.get('/users', protect, authorize('ADMIN', 'MODERATOR', 'SUPER_ADMIN'), adminController.getUsers);
router.get('/search', protect, authorize('ADMIN', 'MODERATOR', 'SUPER_ADMIN'), adminController.searchUsers);
router.post('/ban/:userId', protect, authorize('ADMIN', 'SUPER_ADMIN'), adminController.banUser);
router.post('/unban/:userId', protect, authorize('ADMIN', 'SUPER_ADMIN'), adminController.unbanUser);
router.delete('/delete/:userId', protect, authorize('SUPER_ADMIN'), adminController.deleteUser);
router.post('/promote/:userId', protect, isSuperAdmin, adminController.promoteUser);
router.get('/audit-logs', protect, isSuperAdmin, adminController.getAuditLogs);
router.get('/stats', protect, authorize('ADMIN', 'SUPER_ADMIN'), adminController.getStats);
router.get('/user-details/:userId', protect, authorize('ADMIN', 'SUPER_ADMIN'), adminController.getUserDetails);
router.post('/send-notification', protect, authorize('ADMIN', 'MODERATOR', 'SUPER_ADMIN'), adminController.sendUserNotification);
router.post('/create-admin', protect, isSuperAdmin, adminController.createAdmin);
router.post('/ban-fingerprint', protect, authorize('ADMIN', 'SUPER_ADMIN'), adminController.banFingerprint);
router.get('/all-matches', protect, authorize('ADMIN', 'SUPER_ADMIN'), async (req, res) => {
    const Match = require('../models/match.model');
    try {
        const matches = await Match.find({ isActive: true })
            .populate('user1Id', 'displayName profilePhoto email')
            .populate('user2Id', 'displayName profilePhoto email');
        res.json(matches);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

router.put('/users/role', protect, updateUserRole);

module.exports = router;
