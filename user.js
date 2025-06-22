const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('./auth');
const { requirePermission } = require('./permissions');
const { authLimiter } = require('./middleware/rateLimiter');
const ResponseHandler = require('./utils/responseHandler');
const ValidationUtils = require('./utils/validation');
const { USER_TYPES, SECURITY, ERROR_MESSAGES, SUCCESS_MESSAGES } = require('./config/constants');
require('dotenv').config();

// Import User model
const User = require('./models/User');

/**
 * Helper function to hash password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
async function hashPassword(password) {
    return await bcrypt.hash(password, SECURITY.BCRYPT_ROUNDS);
}

/**
 * Helper function to compare password
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password
 * @returns {Promise<boolean>} - Password match
 */
async function comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
}

/**
 * Helper function to generate JWT token
 * @param {Object} user - User object
 * @returns {string} - JWT token
 */
function generateToken(user) {
    return jwt.sign({ 
        id: user._id, 
        email: user.email, 
        userType: user.userType,
        name: user.username
    }, process.env.JWT_SECRET || 'secret', { 
        expiresIn: SECURITY.JWT_EXPIRES_IN 
    });
}

// Get all users (Admin only)
router.get('/', authenticateToken, requirePermission('canManageUsers'), async (req, res) => {
    try {
        const users = await User.find({}, { password: 0 });
        
        if (users.length === 0) {
            return ResponseHandler.emptyList(res, "No se encontraron usuarios");
        }
        
        ResponseHandler.success(res, 200, "Usuarios obtenidos exitosamente", users);
    } catch (error) {
        ResponseHandler.error(res, 500, error.message);
    }
});

// Get specific user (Admin only)
router.get('/:id', authenticateToken, requirePermission('canManageUsers'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id, { password: 0 });
        
        if (!user) {
            return ResponseHandler.notFound(res, 'Usuario');
        }
        
        ResponseHandler.success(res, 200, "Usuario obtenido exitosamente", user);
    } catch (error) {
        ResponseHandler.error(res, 500, error.message);
    }
});

// Register (Admin only)
router.post('/register', 
    authenticateToken, 
    requirePermission('canManageUsers'),
    ValidationUtils.validateRequest(ValidationUtils.validateUserRegistration),
    async (req, res) => {
        try {
            const { username, email, password, userType = USER_TYPES.PET_OWNER } = req.body;
            
            // Check if user already exists
            const existingUser = await User.findOne({ $or: [{ email }, { username }] });
            if (existingUser) {
                return ResponseHandler.validationError(res, 'El usuario ya existe');
            }
            
            // Hash password
            const hashedPassword = await hashPassword(password);
            
            // Create user
            const user = new User({
                username,
                email,
                password: hashedPassword,
                userType
            });
            
            await user.save();
            
            ResponseHandler.created(res, SUCCESS_MESSAGES.REGISTER_SUCCESS, {
                id: user._id,
                username: user.username,
                email: user.email,
                userType: user.userType
            });
        } catch (error) {
            ResponseHandler.error(res, 500, error.message);
        }
    }
);

// Update user (Admin only)
router.put('/:id', 
    authenticateToken, 
    requirePermission('canManageUsers'),
    async (req, res) => {
        try {
            const { id } = req.params;
            const { username, email, userType, password } = req.body;
            
            const updateData = {};
            if (username !== undefined) updateData.username = username;
            if (email !== undefined) updateData.email = email;
            if (userType !== undefined) updateData.userType = userType;
            
            // If password is provided, hash it
            if (password) {
                updateData.password = await hashPassword(password);
            }
            
            const user = await User.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            ).select('-password');
            
            if (!user) {
                return ResponseHandler.notFound(res, 'Usuario');
            }
            
            ResponseHandler.updated(res, "Usuario actualizado exitosamente", user);
        } catch (error) {
            ResponseHandler.error(res, 400, error.message);
        }
    }
);

// Delete user (Admin only)
router.delete('/:id', authenticateToken, requirePermission('canDeleteAllUsers'), async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        
        if (!user) {
            return ResponseHandler.notFound(res, 'Usuario');
        }
        
        ResponseHandler.deleted(res, "Usuario eliminado exitosamente");
    } catch (error) {
        ResponseHandler.error(res, 500, error.message);
    }
});

// Login (Public access)
router.post('/login', 
    authLimiter, // Rate limiting for login attempts
    ValidationUtils.validateRequest(ValidationUtils.validateLoginData),
    async (req, res) => {
        try {
            const { email, password } = req.body;
            
            // Find user
            const user = await User.findOne({ email });
            if (!user) {
                return ResponseHandler.unauthorized(res, ERROR_MESSAGES.INVALID_CREDENTIALS);
            }
            
            // Check password
            const isMatch = await comparePassword(password, user.password);
            if (!isMatch) {
                return ResponseHandler.unauthorized(res, ERROR_MESSAGES.INVALID_CREDENTIALS);
            }
            
            // Generate token
            const token = generateToken(user);
            
            ResponseHandler.success(res, 200, SUCCESS_MESSAGES.LOGIN_SUCCESS, {
                token: token,
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    userType: user.userType,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            });
        } catch (error) {
            ResponseHandler.error(res, 500, error.message);
        }
    }
);

module.exports = router; 