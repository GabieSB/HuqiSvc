const rateLimit = require('express-rate-limit');
const { SECURITY } = require('../config/constants');

// General rate limiter for all routes
const generalLimiter = rateLimit({
    windowMs: SECURITY.RATE_LIMIT_WINDOW_MS,
    max: SECURITY.RATE_LIMIT_MAX_REQUESTS,
    message: {
        success: false,
        message: 'Demasiadas solicitudes, intente más tarde',
        data: null
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Specific rate limiter for authentication endpoints
const authLimiter = rateLimit({
    windowMs: SECURITY.RATE_LIMIT_WINDOW_MS,
    max: SECURITY.RATE_LIMIT_AUTH_MAX_REQUESTS,
    message: {
        success: false,
        message: 'Demasiados intentos de autenticación, intente más tarde',
        data: null
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Specific rate limiter for create operations
const createLimiter = rateLimit({
    windowMs: SECURITY.RATE_LIMIT_WINDOW_MS,
    max: SECURITY.RATE_LIMIT_CREATE_MAX_REQUESTS,
    message: {
        success: false,
        message: 'Demasiadas solicitudes de creación, intente más tarde',
        data: null
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    generalLimiter,
    authLimiter,
    createLimiter
}; 