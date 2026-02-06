const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/admin.middleware');
const { getContent, addContent, trackUsage, updateContent, deleteContent } = require('../controllers/content.controller');

router.get('/', protect, getContent);
router.post('/', protect, addContent);
router.post('/track/:id', protect, trackUsage);

// Admin only management
router.patch('/:id', protect, authorize('ADMIN', 'SUPER_ADMIN'), updateContent);
router.delete('/:id', protect, authorize('ADMIN', 'SUPER_ADMIN'), deleteContent);

module.exports = router;
