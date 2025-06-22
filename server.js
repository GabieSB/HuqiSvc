const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { 
    securityHeaders, 
    corsOptions, 
    requestLogger, 
    errorHandler, 
    notFoundHandler 
} = require('./middleware/security');
const { generalLimiter } = require('./middleware/rateLimiter');
require('dotenv').config();

const app = express();

// Security middleware
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(generalLimiter); // General rate limiter for all routes

// Request logging
app.use(requestLogger);

// Error handling for payload too large
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 413) {
        return res.status(413).json({
            success: false,
            message: 'El archivo es demasiado grande. Máximo 50MB permitido.',
            data: null
        });
    }
    next(err);
});

// Body parsing middleware with limits
app.use(express.json({ 
    limit: '50mb',
    verify: (req, res, buf) => {
        try {
            JSON.parse(buf);
        } catch (e) {
            res.status(400).json({
                success: false,
                message: 'Invalid JSON',
                data: null
            });
            throw new Error('Invalid JSON');
        }
    }
}));
app.use(express.urlencoded({ 
    limit: '50mb',
    extended: true 
}));

// MongoDB connection with better error handling
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
.then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    console.log(`📊 Database: ${mongoose.connection.name}`);
})
.catch(err => {
    console.error('❌ Could not connect to MongoDB:', err);
    process.exit(1);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is running',
        data: {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
        }
    });
});

// Welcome endpoint
app.get('/', (req, res) => {
    res.json({ 
        success: true,
        message: 'Welcome to the Pet Management API',
        data: {
            version: '1.0.0',
            endpoints: {
                pets: '/api/pets',
                users: '/api/users',
                health: '/health'
            }
        }
    });
});

// API Routes
const petRoutes = require('./pet');
app.use('/api/pets', petRoutes);

const userRoutes = require('./user');
app.use('/api/users', userRoutes);

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Error closing MongoDB connection:', error);
        process.exit(1);
    }
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Error closing MongoDB connection:', error);
        process.exit(1);
    }
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📅 Started at: ${new Date().toISOString()}`);
});

// Handle server errors
server.on('error', (error) => {
    if (error.syscall !== 'listen') {
        throw error;
    }

    switch (error.code) {
        case 'EACCES':
            console.error(`Port ${PORT} requires elevated privileges`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(`Port ${PORT} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
}); 