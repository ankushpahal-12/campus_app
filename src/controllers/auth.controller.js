const authService = require('../services/auth.service');
const { logDevice } = require('./device.controller');
const User = require('../models/user.model');

// 1. Request OTP
// 1. Request OTP
exports.requestOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    await authService.requestOTP(email);
    res.status(200).json({ message: 'OTP sent successfully to your email' });
  } catch (error) {
    error.statusCode = 500;
    next(error);
  }
};

exports.resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    await authService.resendOTP(email);
    res.status(200).json({ message: 'OTP resent successfully' });
  } catch (error) {
    error.statusCode = 500;
    next(error);
  }
};

exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp, password, displayName } = req.body;

    const result = await authService.verifyOTP(email, otp, req);

    if (result.isNewUser) {
      if (!password) {
        return res.status(200).json({
          isNewUser: true,
          message: 'OTP verified. Please provide password to complete signup.'
        });
      }

      const user = await User.create({
        email,
        passwordHash: password,
        displayName,
        isVerified: true
      });

      await logDevice(user._id, req);
      const tokens = await authService.loginUser(email, password, req);
      return res.status(201).json({ message: 'User created successfully', ...tokens });
    }

    await logDevice(result.user.id, req);
    res.status(200).json({ message: 'User verified successfully', ...result });
  } catch (error) {
    error.statusCode = 400;
    next(error);
  }
};

// 3. Login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password, req);

    await logDevice(result.user.id, req);
    res.json(result);
  } catch (error) {
    error.statusCode = 401;
    next(error);
  }
};

// 4. Refresh Token
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshAccessToken(refreshToken);
    res.json(tokens);
  } catch (error) {
    error.statusCode = 401;
    next(error);
  }
};

// 5. Logout
exports.logout = async (req, res, next) => {
  try {
    const { refreshToken, accessToken } = req.body;
    await authService.logoutUser(req.user.id, refreshToken, accessToken || req.headers.authorization?.split(' ')[1]);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    error.statusCode = 500;
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user.id, currentPassword, newPassword);
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    error.statusCode = 400;
    next(error);
  }
};

exports.verifyPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    await authService.verifyPassword(req.user.id, password);
    res.json({ message: 'Password verified successfully' });
  } catch (error) {
    error.statusCode = 401;
    next(error);
  }
};