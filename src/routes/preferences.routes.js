const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { getPreferences, updatePreferences } = require('../controllers/preference.controller');

router.get('/', protect, getPreferences);
router.put('/', protect, updatePreferences);

module.exports = router;
