const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { updatePresence, getPresence } = require('../controllers/presence.controller');

router.post('/ping', protect, updatePresence);
router.get('/:userId', protect, getPresence);

module.exports = router;
