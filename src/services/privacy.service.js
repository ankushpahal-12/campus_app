const { logAction } = require('./audit.service');

/**
 * Mask PII data for public consumption
 */
exports.maskData = (value, type, req = null) => {
    if (!value) return value;

    // Log sensitive data access for audit trail
    if (req && req.user) {
        // We log that PII of this type was processed (not the value itself)
        console.log(`[Privacy] PII Access logged: User ${req.user._id} accessed ${type} data`);
    }

    if (type === 'email') {
        const [name, domain] = value.split('@');
        return `${name[0]}${new Array(name.length).join('*')}@${domain}`;
    }

    if (type === 'phone') {
        return value.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2');
    }

    return value;
};

/**
 * Filter profile data based on owner's privacy settings
 * @param {Object} profile 
 * @param {boolean} isOwner 
 * @param {boolean} isMatch 
 */
exports.filterProfileData = (profile, isOwner, isMatch) => {
    if (isOwner) return profile;

    const visibility = profile.visibility || {};
    const filtered = { ...profile.toObject() };

    if (visibility.hideOnlineStatus && !isMatch) delete filtered.isOnline;
    if (visibility.hideLastSeen && !isMatch) delete filtered.lastSeen;
    if (visibility.hideDistance && !isMatch) delete filtered.distance;

    // Phase 44 Privacy Controls
    if (visibility.showAge === false && !isMatch) delete filtered.age;
    if (visibility.showAge === false && !isMatch) delete filtered.dateOfBirth;
    if (visibility.showLocation === false && !isMatch) {
        delete filtered.location.coordinates;
        delete filtered.location.address;
    }

    return filtered;
};
