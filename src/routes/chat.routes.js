const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { getMessages, markRead } = require('../controllers/chat.controller');

const { apiLimiter } = require('../middlewares/rateLimit.middleware');
const { hardenSession } = require('../middlewares/security.middleware');

router.get('/:matchId', protect, hardenSession, getMessages);
router.put('/:matchId/read', protect, markRead);

module.exports = router;
