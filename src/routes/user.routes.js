const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { getMe, updateMe, deleteAccount, deactivateAccount, restoreAccount } = require('../controllers/user.controller');

const { hardenSession } = require('../middlewares/security.middleware');

router.get('/me', protect, hardenSession, getMe);
router.put('/me', protect, hardenSession, updateMe);
router.post('/delete-account', protect, deleteAccount);
router.post('/deactivate-account', protect, deactivateAccount);
router.post('/restore-account', protect, restoreAccount);

module.exports = router;
