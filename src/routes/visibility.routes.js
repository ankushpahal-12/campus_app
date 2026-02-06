const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { getVisibility, updateVisibility } = require('../controllers/visibility.controller');

router.get('/', protect, getVisibility);
router.put('/', protect, updateVisibility);

router.get('/notifications', protect, require('../controllers/visibility.controller').getNotificationSettings);
router.put('/notifications', protect, require('../controllers/visibility.controller').updateNotificationSettings);

module.exports = router;
