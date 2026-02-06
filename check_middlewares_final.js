const express = require('express');
const { authLimiter } = require('./src/middlewares/rateLimit.middleware');
const { validate, loginSchema } = require('./src/utils/validator.util');
const { login } = require('./src/controllers/auth.controller');
const { checkDeviceStatus } = require('./src/middlewares/device.middleware');

function check(name, obj) {
    console.log(`${name} type:`, typeof obj);
    if (typeof obj === 'function') {
        console.log(`${name} signature:`, obj.toString().split('\n')[0]);
        console.log(`${name} length:`, obj.length);
    }
}

console.log('--- Middleware Check ---');
check('authLimiter', authLimiter);
check('apiLimiter (from rateLimit)', require('./src/middlewares/rateLimit.middleware').apiLimiter);
check('checkDeviceStatus', checkDeviceStatus);

const v = validate(loginSchema);
check('validate(loginSchema)', v);
check('login controller', login);

console.log('--- End Check ---');
process.exit(0);
