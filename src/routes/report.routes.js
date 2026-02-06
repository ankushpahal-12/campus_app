const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/admin.middleware');
const { reportUser, getReports, resolveReport, getMyReports, reportViolation } = require('../controllers/report.controller');

// User routes
router.post('/', protect, reportUser);
router.get('/my-reports', protect, getMyReports);
router.post('/violation', protect, reportViolation);

// Admin routes
router.get('/all', protect, authorize('ADMIN', 'MODERATOR'), getReports);
router.put('/:reportId/resolve', protect, authorize('ADMIN', 'MODERATOR'), resolveReport);

module.exports = router;
