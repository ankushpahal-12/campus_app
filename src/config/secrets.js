

const secrets = {
    jwtSecret: process.env.JWT_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    emailPass: process.env.EMAIL_PASS,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
    firebaseServiceAccount: process.env.FIREBASE_SERVICE_ACCOUNT ?
        (typeof process.env.FIREBASE_SERVICE_ACCOUNT === 'string' ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) : process.env.FIREBASE_SERVICE_ACCOUNT)
        : null,
    redisUrl: process.env.REDIS_URL,
};

// Simple validation
Object.entries(secrets).forEach(([key, value]) => {
    if (!value && key !== 'jwtRefreshSecret') {
        console.warn(`Warning: Secret ${key} is not set in environment variables.`);
    }
});

module.exports = secrets;
