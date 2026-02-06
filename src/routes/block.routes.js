const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { blockUser, unblockUser, getBlockedUsers } = require('../controllers/block.controller');

router.post('/block', protect, blockUser);
router.post('/unblock', protect, unblockUser);
router.get('/', protect, getBlockedUsers);

module.exports = router;
