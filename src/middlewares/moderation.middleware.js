const { scanSuspicious } = require('../utils/textScan.util');
const { logAction } = require('../services/audit.service');

/**
 * Automatically moderate specific fields in the request body
 * @param {string[]} fields 
 */
exports.autoModerate = (fields = ['content', 'bio']) => {
    return async (req, res, next) => {
        let suspiciousFound = false;

        fields.forEach(field => {
            if (req.body[field]) {
                const { isClean, matches } = scanSuspicious(req.body[field]);
                if (!isClean) {
                    suspiciousFound = true;
                    // Tag request for downstream logging or restriction
                    req.moderationFlag = matches;
                }
            }
        });

        if (suspiciousFound) {
            await logAction(req.user.id, 'CONTENT_FLAGGED', req, {
                flags: req.moderationFlag
            });
        }

        next();
    };
};
