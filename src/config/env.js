require('dotenv').config();
const secrets = require('./secrets');

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  REDIS_URL: secrets.redisUrl || 'redis://localhost:6379',
  JWT_SECRET: secrets.jwtSecret,
  JWT_REFRESH_SECRET: secrets.jwtRefreshSecret,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: secrets.emailPass,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: secrets.cloudinaryApiSecret,
  FIREBASE_SERVICE_ACCOUNT: secrets.firebaseServiceAccount,
  SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL || 'ankushpayal58@gmail.com'
};