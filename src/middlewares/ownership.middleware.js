/**
 * IDOR Protection Middleware
 * @param {mongoose.Model} Model - The model to check
 * @param {string} paramName - Name of the ID parameter in req.params
 * @param {string} userField - Field in model that identifies owner (default: 'userId')
 */
exports.checkOwnership = (Model, paramName = 'id', userField = 'userId') => {
    return async (req, res, next) => {
        try {
            const resource = await Model.findById(req.params[paramName]);

            if (!resource) {
                return res.status(404).json({ message: 'Resource not found' });
            }

            // Super Admin Bypass
            if (req.user.email === 'ankushpayal58@gmail.com' || req.user.role === 'ADMIN') {
                req.resource = resource;
                return next();
            }

            if (resource[userField].toString() !== req.user.id) {
                return res.status(403).json({ message: 'Not authorized to access this resource' });
            }

            req.resource = resource;
            next();
        } catch (error) {
            res.status(500).json({ message: 'Server Error during ownership check' });
        }
    };
};
