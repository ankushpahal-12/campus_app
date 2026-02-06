const Profile = require('../models/profile.model');
const Preference = require('../models/preference.model');
const User = require('../models/user.model');
const { encrypt, decrypt } = require('../utils/encryption.util');

exports.getProfile = async (userId) => {
    return await Profile.findOne({ userId }).populate('userId', 'displayName email role profilePhoto');
};

exports.updateProfile = async (userId, updateData) => {
    return await Profile.findOneAndUpdate(
        { userId },
        { $set: updateData },
        { new: true, upsert: true }
    );
};

exports.getPreferences = async (userId) => {
    const [preference, profile] = await Promise.all([
        Preference.findOne({ userId }),
        Profile.findOne({ userId })
    ]);

    if (!preference) return null;

    return {
        ...preference.toObject(),
        interests: profile?.interests || [],
        interestedInPurpose: profile?.relationshipGoal || 'Not Sure'
    };
};

exports.updatePreferences = async (userId, updateData) => {
    const { minAge, maxAge, maxDistance, interestedIn, showMe, interests, interestedInPurpose } = updateData;

    // 1. Update Preference Model
    const preferenceUpdate = {};
    if (minAge !== undefined) preferenceUpdate.minAge = minAge;
    if (maxAge !== undefined) preferenceUpdate.maxAge = maxAge;
    if (maxDistance !== undefined) preferenceUpdate.maxDistance = maxDistance;
    if (interestedIn !== undefined) preferenceUpdate.interestedIn = interestedIn;
    if (showMe !== undefined) preferenceUpdate.showMe = showMe;

    const preference = await Preference.findOneAndUpdate(
        { userId },
        { $set: preferenceUpdate },
        { new: true, upsert: true }
    );

    // 2. Update Profile Model (Interests & Goal)
    const profileUpdate = {};
    if (interests !== undefined) {
        // Enforce 5-interest limit on backend for safety
        profileUpdate.interests = interests.slice(0, 5);
    }
    if (interestedInPurpose !== undefined) {
        profileUpdate.relationshipGoal = interestedInPurpose;
    }

    if (Object.keys(profileUpdate).length > 0) {
        await Profile.findOneAndUpdate(
            { userId },
            { $set: profileUpdate },
            { new: true, upsert: true }
        );
    }

    return {
        ...preference.toObject(),
        interests: profileUpdate.interests || [],
        interestedInPurpose: profileUpdate.relationshipGoal
    };
};

exports.uploadPhoto = async (userId, photoUrl) => {
    const encryptedUrl = encrypt(photoUrl);

    // 1. Update User model (Primary profile photo)
    await User.findByIdAndUpdate(userId, { profilePhoto: encryptedUrl });

    // 2. Append to Profile model's photos array
    const profile = await Profile.findOneAndUpdate(
        { userId },
        { $push: { photos: encryptedUrl } },
        { new: true, upsert: true }
    );

    if (profile.photos) profile.photos = profile.photos.map(p => decrypt(p));
    return profile;
};

exports.deletePhoto = async (userId, photoUrl) => {
    // Since IV is random, we can't $pull by encrypted string easily if we don't have the original encrypted string.
    // We fetch, find the match in decrypted space, then pull the specific encrypted string.
    const profile = await Profile.findOne({ userId });
    if (!profile) return null;

    const encryptedToRemove = profile.photos.find(p => decrypt(p) === photoUrl);

    if (encryptedToRemove) {
        await Profile.findOneAndUpdate(
            { userId },
            { $pull: { photos: encryptedToRemove } }
        );
    }

    // 2. If this was the User.profilePhoto, set it to the first available photo or null
    const user = await User.findById(userId);
    if (user.profilePhoto && decrypt(user.profilePhoto) === photoUrl) {
        const updatedProfile = await Profile.findOne({ userId });
        const nextPhotoEncrypted = updatedProfile.photos.length > 0 ? updatedProfile.photos[0] : null;
        await User.findByIdAndUpdate(userId, { profilePhoto: nextPhotoEncrypted });
    }

    const finalProfile = await Profile.findOne({ userId });
    if (finalProfile.photos) finalProfile.photos = finalProfile.photos.map(p => decrypt(p));
    return finalProfile;
};

exports.setPrimaryPhoto = async (userId, photoUrl) => {
    const profile = await Profile.findOne({ userId });
    const encryptedUrl = profile.photos.find(p => decrypt(p) === photoUrl);

    if (encryptedUrl) {
        await User.findByIdAndUpdate(userId, { profilePhoto: encryptedUrl });
    }

    return profile;
};
