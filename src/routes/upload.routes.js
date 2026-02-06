const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { uploadChatMedia } = require('../controllers/upload.controller');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'campus_dating/chats',
        allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
        transformation: [{ width: 1200, height: 1200, crop: 'limit' }]
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit for chat media
});

router.post('/chat-media', protect, upload.single('media'), uploadChatMedia);

module.exports = router;
