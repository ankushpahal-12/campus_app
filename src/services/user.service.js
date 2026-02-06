const User = require('../models/user.model');
const Profile = require('../models/profile.model');
const mailService = require('./mail.service');
const notificationService = require('./notification.service');
const { logAction } = require('./audit.service');

exports.scheduleAccountDeletion = async (userId, reason, req) => {
    // 1. Mark user as deleted (deactivated)
    const user = await User.findByIdAndUpdate(userId, { isDeleted: true }, { new: true });

    // 2. Hide profile from discovery
    await Profile.findOneAndUpdate({ userId }, { 'visibility.hideDistance': true, 'visibility.hideOnlineStatus': true });

    // 3. Create deletion scheduled record (30 days from now)
    const processedAt = new Date();
    processedAt.setDate(processedAt.getDate() + 30);

    await AccountDeletion.findOneAndUpdate(
        { userId },
        {
            reason,
            requestedAt: new Date(),
            scheduledFor: processedAt
        },
        { upsert: true, new: true }
    );

    // 4. Send Email
    mailService.sendAccountDeletionScheduledEmail(user.email, user.displayName, processedAt).catch(err => {
        console.error("Failed to send deletion email:", err);
    });

    // 5. Send Notification
    notificationService.sendNotification(
        userId,
        "Account Deletion Scheduled",
        "Your account is scheduled for deletion in 30 days. Log in anytime to restore it."
    ).catch(err => {
        console.error("Failed to send deletion notification:", err);
    });

    await logAction(userId, 'ACCOUNT_DELETE_REQUESTED', req, { scheduledDate: processedAt });
    return true;
};

exports.restoreUser = async (userId, req) => {
    // 1. Unmark deleted/deactivated
    const user = await User.findByIdAndUpdate(userId, {
        isDeleted: false,
        isActive: true,
        'deactivation.deactivatedUntil': null
    }, { new: true });

    // 2. Remove deletion schedule
    await AccountDeletion.deleteOne({ userId });

    // 3. Send Email
    mailService.sendAccountRestoredEmail(user.email, user.displayName).catch(err => {
        console.error("Failed to send restoration email:", err);
    });

    await logAction(userId, 'ACCOUNT_RESTORED', req);
    return true;
};

exports.requestRestoration = async (userId, req) => {
    const deletion = await AccountDeletion.findOne({ userId });

    if (!deletion) throw new Error('No deletion record found for this user');

    if (deletion.restorationAttempts >= 2) {
        throw new Error('Maximum restoration attempts reached. This account will be permanently deleted.');
    }

    deletion.restorationRequested = true;
    deletion.restorationRequestedAt = new Date();
    deletion.restorationAttempts += 1;
    await deletion.save();

    await logAction(userId, 'USER_RESTORATION_REQUESTED', req, { attempt: deletion.restorationAttempts });
    return true;
};

exports.getDeletionStatus = async (userId) => {
    return await AccountDeletion.findOne({ userId });
};

exports.deactivateAccount = async (userId, days, req) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // 1. Check cool-down period (7 days)
    if (user.deactivation.lastDeactivatedAt) {
        const diffTime = Math.abs(new Date() - user.deactivation.lastDeactivatedAt);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 7) {
            throw new Error(`You can only deactivate your account once every 7 days. Please wait ${7 - diffDays} more days.`);
        }
    }

    // 2. Calculate deactivatedUntil if applicable
    let deactivatedUntil = null;
    if (days && days !== 'until_login') {
        const duration = parseInt(days);
        if (isNaN(duration)) throw new Error('Invalid duration');
        deactivatedUntil = new Date();
        deactivatedUntil.setDate(deactivatedUntil.getDate() + duration);
    }

    // 3. Update User
    user.isActive = false;
    user.deactivation.deactivatedUntil = deactivatedUntil;
    user.deactivation.lastDeactivatedAt = new Date();
    await user.save();

    await logAction(userId, 'ACCOUNT_DEACTIVATED', req, { days, deactivatedUntil });
    return true;
};
