const Content = require('../models/content.model');

// @desc    Get content by type and category
// @route   GET /api/content
// @access  Private
exports.getContent = async (req, res) => {
    try {
        const { type, category } = req.query;
        const query = { isActive: true };
        if (type) query.type = type.toUpperCase();
        if (category) query.category = category;

        // Admins see everything, users see admin-authored + their own
        if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
            query.$or = [{ isAdminAuthored: true }, { addedBy: req.user.id }];
        }

        const content = await Content.find(query).sort({ usageCount: -1 });
        res.json(content);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add custom content (User or Admin)
// @route   POST /api/content
// @access  Private
exports.addContent = async (req, res) => {
    try {
        const { type, value, category } = req.body;
        const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN';

        const content = await Content.create({
            type: type.toUpperCase(),
            value,
            category: category || 'General',
            addedBy: req.user.id,
            isAdminAuthored: isAdmin
        });

        res.status(201).json(content);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Content already exists' });
        }
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Track content usage
// @route   POST /api/content/track/:id
// @access  Private
exports.trackUsage = async (req, res) => {
    try {
        await Content.findByIdAndUpdate(req.params.id, { $inc: { usageCount: 1 } });
        res.json({ message: 'Usage tracked' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Manage content (Admin only)
// @route   PATCH /api/content/:id
// @access  Private/Admin
exports.updateContent = async (req, res) => {
    try {
        const content = await Content.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(content);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete content (Admin only)
// @route   DELETE /api/content/:id
// @access  Private/Admin
exports.deleteContent = async (req, res) => {
    try {
        await Content.findByIdAndDelete(req.params.id);
        res.json({ message: 'Content deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
