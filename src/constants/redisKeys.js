module.exports = {
    KEYS: {
        REFRESH_TOKEN: (userId, token) => `refresh:${userId}:${token}`,
        USER_ONLINE: (userId) => `user:online:${userId}`,
        USER_STATUS: (userId) => `user:status:${userId}`,
        OTP: (email) => `otp:${email}`
    },
    EXPIRY: {
        REFRESH_TOKEN: 7 * 24 * 60 * 60, // 7 days
        OTP: 300 // 5 minutes
    }
};
