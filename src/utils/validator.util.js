const Joi = require('joi');

const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).optional(), // Password optional for OTP request initially? No, requestOTP just needs email
});

const otpRequestSchema = Joi.object({
    email: Joi.string().email().required()
});

const otpVerifySchema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(4).required(),
    password: Joi.string().min(6).required(),
    displayName: Joi.string().min(3).max(30).optional()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

const { MAX_INTERESTS } = require('../constants/interests');

const profileUpdateSchema = Joi.object({
    displayName: Joi.string().min(3).max(30).optional(),
    bio: Joi.string().max(500).optional(),
    profilePhoto: Joi.string().uri().optional(),
    interests: Joi.array().items(Joi.string()).max(MAX_INTERESTS).optional()
});

const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};

module.exports = {
    otpRequestSchema,
    otpVerifySchema,
    loginSchema,
    profileUpdateSchema,
    validate
};
