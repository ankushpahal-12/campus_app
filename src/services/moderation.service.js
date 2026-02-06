const { scanSuspicious } = require('../utils/textScan.util');
const { logAction } = require('./audit.service');

/**
 * Moderate text content for a user
 * @param {string} userId 
 * @param {string} content 
 * @returns {Promise<boolean>} - true if clean, false if flagged
 */
exports.moderateContent = async (userId, content) => {
    const { isClean, matches } = scanSuspicious(content);

    if (!isClean) {
        await logAction(userId, 'CONTENT_MODERATION_FLAG', null, {
            matches,
            contentSnippet: content.substring(0, 100)
        });
        return false;
    }

    return true;
};

/**
 * Perform bulk moderation (e.g. on profile creation)
 */
exports.bulkModerate = async (userId, dataMap) => {
    const results = {};
    for (const [key, value] of Object.entries(dataMap)) {
        if (typeof value === 'string') {
            results[key] = await this.moderateContent(userId, value);
        }
    }
    return results;
};
