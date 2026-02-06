const express = require('express');
const router = express.Router();
const { requestOTP, resendOTP, verifyOTP, login, refreshToken, logout, changePassword, verifyPassword } = require('../controllers/auth.controller');
const { validate, otpRequestSchema, otpVerifySchema, loginSchema } = require('../utils/validator.util');
const { protect } = require('../middlewares/auth.middleware');
const { authLimiter, otpLimiter } = require('../middlewares/rateLimit.middleware');

router.post('/request-otp', otpLimiter, validate(otpRequestSchema), requestOTP);
router.post('/resend-otp', otpLimiter, validate(otpRequestSchema), resendOTP);
router.post('/verify-otp', authLimiter, validate(otpVerifySchema), verifyOTP);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh-token', refreshToken);
router.post('/logout', protect, logout);
router.post('/change-password', protect, changePassword);
router.post('/verify-password', protect, verifyPassword);

module.exports = router;