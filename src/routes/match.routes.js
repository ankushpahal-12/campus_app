const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { getDiscovery, swipe, getMatches } = require('../controllers/match.controller');

const { apiLimiter } = require('../middlewares/rateLimit.middleware');
const { hardenSession } = require('../middlewares/security.middleware');

router.get('/discovery', protect, hardenSession, getDiscovery);
router.post('/swipe', protect, apiLimiter, swipe);
router.get('/my-matches', protect, getMatches);

module.exports = router;
