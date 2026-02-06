const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { getProfile, updateProfile, getPreferences, updatePreferences, uploadPhoto, deletePhoto, setPrimaryPhoto } = require('../controllers/profile.controller');
const upload = require('../middlewares/upload.middleware');

// Profile
router.get('/', protect, getProfile);
router.get('/:userId', protect, getProfile);
router.put('/', protect, updateProfile);
router.post('/upload-photo', protect, upload.single('photo'), uploadPhoto);
router.post('/delete-photo', protect, deletePhoto);
router.post('/set-primary-photo', protect, setPrimaryPhoto);

// Preferences
router.get('/preferences', protect, getPreferences);
router.put('/preferences', protect, updatePreferences);

module.exports = router;