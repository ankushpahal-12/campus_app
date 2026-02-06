const adminService = require('../services/admin.service');

exports.getUsers = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const users = await adminService.getAllUsers(page, limit);
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.banUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await adminService.updateUserStatus(userId, 'BAN', req.user.id);
        res.json({ message: 'User banned', user });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.unbanUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await adminService.updateUserStatus(userId, 'UNBAN', req.user.id);
        res.json({ message: 'User unbanned', user });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await adminService.updateUserStatus(userId, 'DELETE', req.user.id);
        res.json({ message: 'User deleted permanently', user });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.promoteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!['ADMIN', 'MODERATOR', 'SUPER_ADMIN'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await adminService.promoteUser(userId, role, req.user.id);
        res.json({ message: `User promoted to ${role}`, user });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getStats = async (req, res) => {
    try {
        const stats = await adminService.getDashboardStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;
        const details = await adminService.getUserFullDetails(userId);
        res.json(details);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.createAdmin = async (req, res) => {
    try {
        const admin = await adminService.createAdminAccount(req.body, req.user.id);
        res.status(201).json({ message: 'Admin account created', admin });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

exports.banFingerprint = async (req, res) => {
    try {
        const { fingerprint } = req.body;
        const result = await adminService.banByFingerprint(fingerprint, req.user.id);
        res.json({ message: 'Device fingerprint banned successfully', ...result });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getAuditLogs = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const logs = await adminService.getSystemAuditLogs(page, limit);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.status(400).json({ message: 'Query is required' });

        const users = await adminService.searchUsers(query);
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.sendUserNotification = async (req, res) => {
    try {
        const { userId, title, body, data } = req.body;
        if (!userId || !title || !body) {
            return res.status(400).json({ message: 'UserId, title, and body are required' });
        }

        const notificationService = require('../services/notification.service');
        await notificationService.sendNotification(userId, title, body, data || {}, req.user.id);

        res.json({ message: 'Notification sent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
