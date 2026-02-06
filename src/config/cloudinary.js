const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const lib = require('multer-storage-cloudinary');

// Node 22 + Modern Multer-Storage-Cloudinary often requires this specific check
const CloudinaryStorage = lib.CloudinaryStorage || lib.default?.CloudinaryStorage || lib;

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
    }
});

module.exports = { cloudinary, upload: multer({ storage }) };