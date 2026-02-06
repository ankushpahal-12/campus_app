const { logAction } = require('../services/audit.service');

exports.uploadChatMedia = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // We wrap in a generic response that the chat service can use
        // The file is already on Cloudinary thanks to multer-storage-cloudinary

        await logAction(req.user.id, 'CHAT_MEDIA_UPLOAD', req);

        res.json({
            message: 'Media uploaded successfully',
            url: req.file.path,
            type: req.file.mimetype.startsWith('image/') ? 'image' : 'file'
        });
    } catch (error) {
        console.error("Chat media upload error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};
