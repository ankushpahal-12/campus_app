const User = require('../models/user.model');
const Profile = require('../models/profile.model');
const AccountDeletion = require('../models/accountDeletion.model');
const { logAction } = require('./audit.service');

/**
 * Handle account deactivation
 */
exports.deactivateAccount = async (userId, req) => {
    await User.findByIdAndUpdate(userId, { isActive: false });

    await logAction(userId, 'ACCOUNT_DEACTIVATED', req);
    return true;
};

/**
 * Handle account restoration
 */
exports.reactivateAccount = async (userId, req) => {
    await User.findByIdAndUpdate(userId, { isActive: true });
    // Cancel any pending deletions
    await AccountDeletion.deleteOne({ userId });
    await logAction(userId, 'ACCOUNT_REACTIVATED', req);
    return true;
};

/**
 * Mark user for permanent deletion
 */
exports.deleteAccount = async (userId, reason, req) => {
    await User.findByIdAndUpdate(userId, { isDeleted: true });

    // Create deletion request record with 30-day window
    await AccountDeletion.create({
        userId,
        reason,
        scheduledFor: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    await logAction(userId, 'ACCOUNT_DELETION_REQUESTED', req);
    return true;
};

/**
 * Process permanent deletions for accounts where the 30-day grace period has expired.
 * This should be called by a scheduled task (cron job).
 */
exports.processHardDeletions = async () => {
    const expiredDeletions = await AccountDeletion.find({
        scheduledFor: { $lte: new Date() },
        processedAt: { $exists: false }
    });

    for (const record of expiredDeletions) {
        // 1. Delete Profile
        await Profile.deleteOne({ userId: record.userId });
        // 2. Delete User
        await User.deleteOne({ _id: record.userId });
        // 3. Mark record as processed
        record.processedAt = new Date();
        await record.save();
    }

    return expiredDeletions.length;
};
