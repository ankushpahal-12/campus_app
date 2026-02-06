/**
 * Middleware to restrict access based on user roles
 * @param {...string} roles - Authorized roles
 */
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }

        next();
    };
};

/**
 * Super Admin Check for specific email requirement
 * ankushpayal58@gmail.com
 */
exports.isSuperAdmin = (req, res, next) => {
    if (req.user && req.user.email === 'ankushpayal58@gmail.com') {
        return next();
    }
    return res.status(403).json({ message: 'Super Admin access required' });
};
