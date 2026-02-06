const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { getDiscovery } = require('../controllers/discover.controller');

router.get('/', protect, getDiscovery);

module.exports = router;
