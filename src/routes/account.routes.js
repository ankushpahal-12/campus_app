const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { deleteAccount, deactivateAccount, reactivateAccount, getDeletionStatus } = require('../controllers/account.controller');

router.post('/deactivate', protect, deactivateAccount);
router.delete('/delete', protect, deleteAccount);
router.get('/status', protect, getDeletionStatus);
router.post('/reactivate', protect, reactivateAccount);

module.exports = router;
