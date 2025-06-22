const helmet = require('helmet');
const { ERROR_MESSAGES } = require('../config/constants');
const ResponseHandler = require('../utils/responseHandler');

/**
 * Security headers middleware
 */
const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"]
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
});

/**
 * CORS configuration
 */
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:5173',
            'https://yourdomain.com' // Add your production domain
        ];
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
    });
    
    next();
};

/**
 * Error handling middleware
 */
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    
    if (err.name === 'ValidationError') {
        return ResponseHandler.validationError(res, err.message);
    }
    
    if (err.name === 'CastError') {
        return ResponseHandler.notFound(res, 'Recurso');
    }
    
    if (err.name === 'MongoError' && err.code === 11000) {
        return ResponseHandler.validationError(res, 'El recurso ya existe');
    }
    
    if (err.name === 'JsonWebTokenError') {
        return ResponseHandler.unauthorized(res, 'Token inválido');
    }
    
    if (err.name === 'TokenExpiredError') {
        return ResponseHandler.unauthorized(res, 'Token expirado');
    }
    
    // Default error
    ResponseHandler.error(res, 500, 'Error interno del servidor');
};

/**
 * 404 handler
 */
const notFoundHandler = (req, res) => {
    ResponseHandler.notFound(res, 'Endpoint');
};

module.exports = {
    securityHeaders,
    corsOptions,
    requestLogger,
    errorHandler,
    notFoundHandler
}; 