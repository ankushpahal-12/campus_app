const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { getDevices, revokeDevice } = require('../controllers/device.controller');

router.get('/', protect, getDevices);
router.delete('/:deviceId', protect, revokeDevice);

module.exports = router;
