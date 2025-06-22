const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const express = require('express');
const { requirePermission } = require('./permissions');

// Import User model
const User = require('./models/User');

// Authentication middleware
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: 'Token de acceso requerido',
            data: null
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        
        // Use imported User model
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: 'Token inválido',
                data: null
            });
        }

        req.user = {
            id: user._id,
            email: user.email,
            userType: user.userType,
            name: user.username
        };
        next();
    } catch (error) {
        return res.status(403).json({ 
            success: false,
            message: 'Token inválido',
            data: null
        });
    }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
    if (req.user.userType !== 1) {
        return res.status(403).json({ 
            success: false,
            message: 'Acceso de administrador requerido',
            data: null
        });
    }
    next();
};

// Check if user is admin or owner of the pet
const isAdminOrOwner = async (req, res, next) => {
    if (req.user.userType === 1) {
        return next(); // Admin can access everything
    }

    // For pet owners, check if they own the pet
    const { id } = req.params;
    const Pet = mongoose.model('Pet');
    
    try {
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
        let pet;
        
        if (isObjectId) {
            pet = await Pet.findById(id);
        } else {
            pet = await Pet.findOne({ uniqueId: id });
        }

        if (!pet) {
            return res.status(404).json({ 
                success: false,
                message: 'Mascota no encontrada',
                data: null
            });
        }

        if (pet.ownerId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ 
                success: false,
                message: 'Acceso denegado. Solo puedes gestionar tus propias mascotas.',
                data: null
            });
        }

        req.pet = pet;
        next();
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message,
            data: null
        });
    }
};

// Register a new user
const router = express.Router();
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, userType = 2 } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'El usuario ya existe',
                data: null
            });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user
        const user = new User({
            username,
            email,
            password: hashedPassword,
            userType
        });
        
        await user.save();
        
        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                userType: user.userType
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: null
        });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas',
                data: null
            });
        }
        
        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas',
                data: null
            });
        }
        
        // Generate token
        const token = jwt.sign(
            { 
                id: user._id, 
                email: user.email, 
                userType: user.userType,
                name: user.username
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            success: true,
            message: 'Login exitoso',
            data: {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    userType: user.userType
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: null
        });
    }
});

// Get all users (Admin only)
router.get('/', authenticateToken, requirePermission('canManageAllUsers'), async (req, res) => {
    try {
        const users = await User.find({}, { password: 0 });
        
        if (users.length === 0) {
            return res.json({
                success: false,
                message: "No se encontraron usuarios",
                data: []
            });
        }
        
        res.json({
            success: true,
            message: "Usuarios obtenidos exitosamente",
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: null
        });
    }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id, { password: 0 });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado',
                data: null
            });
        }
        
        res.json({
            success: true,
            message: "Perfil obtenido exitosamente",
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: null
        });
    }
});

// Update user (Admin can update any user, users can update their own profile)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if user is admin or updating their own profile
        if (req.user.userType !== 1 && req.user.id !== id) {
            return res.status(403).json({
                success: false,
                message: 'Solo puedes actualizar tu propio perfil',
                data: null
            });
        }
        
        const updateData = { ...req.body };
        
        // If password is being updated, hash it
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }
        
        const user = await User.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado',
                data: null
            });
        }
        
        res.json({
            success: true,
            message: "Usuario actualizado exitosamente",
            data: user
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
            data: null
        });
    }
});

// Delete user (Admin only)
router.delete('/:id', authenticateToken, requirePermission('canDeleteAllUsers'), async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado',
                data: null
            });
        }
        
        res.json({
            success: true,
            message: "Usuario eliminado exitosamente",
            data: null
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: null
        });
    }
});

module.exports = { authenticateToken, isAdmin, isAdminOrOwner, router }; 