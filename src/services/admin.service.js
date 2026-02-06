const User = require('../models/user.model');
const AuditLog = require('../models/auditLog.model');
const DeviceSession = require('../models/deviceSession.model');
const Report = require('../models/report.model');

exports.getAllUsers = async (page = 1, limit = 20) => {
    return await User.find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
};

exports.updateUserStatus = async (userId, action, adminId) => {
    let update = {};
    if (action === 'BAN') update = { isActive: false, isRestricted: true };
    if (action === 'UNBAN') update = { isActive: true, isRestricted: false };
    if (action === 'DELETE') update = { isDeleted: true, isActive: false };

    const user = await User.findByIdAndUpdate(userId, update, { new: true });

    await AuditLog.create({
        userId: adminId,
        action: `USER_${action}`,
        details: { targetUserId: userId }
    });

    return user;
};

exports.promoteUser = async (userId, newRole, adminId) => {
    const user = await User.findByIdAndUpdate(userId, { role: newRole }, { new: true });

    await AuditLog.create({
        userId: adminId,
        action: `USER_PROMOTED_TO_${newRole}`,
        details: { targetUserId: userId }
    });

    return user;
};

exports.getSystemAuditLogs = async (page = 1, limit = 50) => {
    return await AuditLog.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('userId', 'displayName email role');
};

exports.getDashboardStats = async () => {
    const totalUsers = await User.countDocuments({ isDeleted: false });
    const bannedUsers = await User.countDocuments({ isRestricted: true });
    const activeSessions = await DeviceSession.countDocuments({ isActive: true });
    const pendingReports = await Report.countDocuments({ status: 'PENDING' });

    return {
        totalUsers,
        bannedUsers,
        activeSessions,
        pendingReports
    };
};

exports.getUserFullDetails = async (userId) => {
    const user = await User.findById(userId).lean();
    const sessions = await DeviceSession.find({ userId }).sort({ lastLoginAt: -1 }).lean();
    const logs = await AuditLog.find({ userId }).sort({ createdAt: -1 }).limit(10).lean();

    return {
        ...user,
        activeSessions: sessions,
        recentActivity: logs
    };
};

exports.createAdminAccount = async (adminData, superAdminId) => {
    const admin = await User.create({
        ...adminData,
        isVerified: true,
        role: adminData.role || 'ADMIN'
    });

    await AuditLog.create({
        userId: superAdminId,
        action: 'CREATE_ADMIN',
        details: { newAdminId: admin._id }
    });

    return admin;
};

exports.banByFingerprint = async (fingerprint, adminId) => {
    // 1. Mark all users on this fingerprint as restricted
    const sessions = await DeviceSession.find({ fingerprint });
    const userIds = sessions.map(s => s.userId);

    await User.updateMany(
        { _id: { $in: userIds } },
        { isActive: false, isRestricted: true }
    );

    // 2. We should also have a specific "BannedFingerprint" model if we want to be strict,
    // but for now, we'll just flag the sessions as inactive or use a blacklist.
    await DeviceSession.updateMany(
        { fingerprint },
        { isActive: false }
    );

    await AuditLog.create({
        userId: adminId,
        action: 'BAN_BY_FINGERPRINT',
        details: { fingerprint, affectedUserCount: userIds.length }
    });

    return { affectedUserCount: userIds.length };
};

exports.searchUsers = async (query) => {
    const regex = new RegExp(query, 'i');
    return await User.find({
        isDeleted: false,
        $or: [
            { displayName: { $regex: regex } },
            { email: { $regex: regex } }
        ]
    }).limit(50).select('displayName email profilePhoto role isActive isRestricted');
};
