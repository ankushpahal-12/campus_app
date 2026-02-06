const Profile = require('../models/profile.model');

/**
 * Update user visibility settings
 * @param {string} userId 
 * @param {object} visibilityData 
 */
exports.updateVisibility = async (userId, visibilityData) => {
    // Use dot notation to prevent overwriting the entire visibility object
    const update = {};
    for (const key in visibilityData) {
        update[`visibility.${key}`] = visibilityData[key];
    }

    return await Profile.findOneAndUpdate(
        { userId },
        { $set: update },
        { new: true, upsert: true }
    );
};

exports.getNotificationSettings = async (userId) => {
    const profile = await Profile.findOne({ userId }).select('notificationSettings');
    return profile ? profile.notificationSettings : { matches: true, messages: true, likes: true };
};

exports.updateNotificationSettings = async (userId, settings) => {
    const update = {};
    for (const key in settings) {
        update[`notificationSettings.${key}`] = settings[key];
    }

    return await Profile.findOneAndUpdate(
        { userId },
        { $set: update },
        { new: true, upsert: true }
    );
};

/**
 * Get user visibility settings
 * @param {string} userId 
 */
exports.getVisibility = async (userId) => {
    const profile = await Profile.findOne({ userId }).select('visibility');
    return profile ? profile.visibility : null;
};
