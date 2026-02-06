const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const MulterStorageCloudinary = require('multer-storage-cloudinary');

// This check handles both new (destructured) and old (default) versions
const CloudinaryStorage = MulterStorageCloudinary.CloudinaryStorage
    ? MulterStorageCloudinary.CloudinaryStorage
    : MulterStorageCloudinary;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_API_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'campus_app',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
    }
});

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };