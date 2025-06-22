const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { nanoid } = require('nanoid');
const { authenticateToken } = require('./auth');
const { requirePermission, canEditOwnPet, canViewOwnPets, canViewPet } = require('./permissions');
const { createLimiter } = require('./middleware/rateLimiter');
const ResponseHandler = require('./utils/responseHandler');
const ValidationUtils = require('./utils/validation');
const geoLocationService = require('./services/geoLocationService');
const qrCodeService = require('./services/qrCodeService');
const { USER_TYPES, ERROR_MESSAGES, SUCCESS_MESSAGES } = require('./config/constants');
require('dotenv').config();

// Base URL for pet links
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// View History Schema
const viewHistorySchema = new mongoose.Schema({
    viewedAt: { type: Date, default: Date.now },
    viewedBy: { type: String, required: true },
    ipAddress: { type: String },
    userAgent: { type: String },
    deviceUsed: {
        type: { type: String },
        brand: { type: String },
        model: { type: String },
        os: { type: String }
    },
    location: {
        country: { type: String },
        city: { type: String },
        region: { type: String },
        coordinates: {
            latitude: { type: Number },
            longitude: { type: Number }
        },
        timezone: { type: String },
        isp: { type: String }
    }
});

// Pet Schema
const petSchema = new mongoose.Schema({
    uniqueId: { 
        type: String, 
        required: true, 
        unique: true,
        default: () => nanoid(10)
    },
    photo: { type: String, default: "" },
    name: { type: String, required: true },
    owner: { type: String, required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    species: { type: String, required: true },
    zone: { type: String, required: true },
    birthdate: { type: String, required: true },
    notes: { type: String, default: "" },
    phone: [{ 
        number: { type: String, required: true },
        owner: { type: String, required: true },
        isPrimary: { type: Boolean, default: false }
    }],
    isLost: { type: Boolean, default: false },
    qrCode: { type: String, default: "" },
    viewHistory: [viewHistorySchema],
    lastModifiedBy: { type: String, default: "Sistema" },
    lastModifiedAt: { type: Date, default: Date.now },
    createdBy: { type: String, default: "Sistema" },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Add index for uniqueId
petSchema.index({ uniqueId: 1 });

const Pet = mongoose.model('Pet', petSchema);

/**
 * Helper function to find pet by ID or uniqueId
 * @param {string} id - Pet ID or uniqueId
 * @returns {Promise<Object>} - Pet object
 */
async function findPetById(id) {
    const isObjectId = ValidationUtils.isValidObjectId(id);
    
    if (isObjectId) {
        return await Pet.findById(id);
    } else {
        return await Pet.findOne({ uniqueId: id });
    }
}

/**
 * Helper function to get device information from request headers
 * @param {Object} headers - Request headers
 * @returns {Object} - Device information
 */
function getDeviceInfo(headers) {
    return {
        type: headers['sec-ch-ua-mobile'] ? 'mobile' : 
              headers['sec-ch-ua-platform']?.includes('tablet') ? 'tablet' : 'desktop',
        brand: headers['sec-ch-ua-platform'] || 'unknown',
        model: headers['sec-ch-ua-model'] || 'unknown',
        os: headers['sec-ch-ua-platform'] || 'unknown'
    };
}

/**
 * Helper function to add view history to pet
 * @param {Object} pet - Pet object
 * @param {Object} req - Express request object
 * @param {Object} ipInfo - IP information
 */
async function addViewHistory(pet, req, ipInfo) {
    const ip = req.ip || req.socket.remoteAddress;
    
    pet.viewHistory.push({
        viewedAt: new Date(),
        viewedBy: req.headers['user-agent'] || 'unknown',
        ipAddress: ip,
        userAgent: req.headers['user-agent'],
        deviceUsed: getDeviceInfo(req.headers),
        location: ipInfo
    });
    
    await pet.save();
}

// Create a new pet (Admin only)
router.post('/', 
    authenticateToken, 
    requirePermission('canManageAllPets'),
    createLimiter, // Rate limiting for create operations
    ValidationUtils.validateRequest(ValidationUtils.validatePetData),
    async (req, res) => {
        try {
            const petData = {
                ...req.body,
                createdBy: req.user.name || req.user.username || "Sistema",
                lastModifiedBy: req.user.name || req.user.username || "Sistema",
                ownerId: req.body.ownerId || req.user.id
            };
            
            const pet = new Pet(petData);
            const savedPet = await pet.save();
            
            // Generate QR code
            const qrCode = await qrCodeService.generateQRCode(savedPet.uniqueId, BASE_URL);
            savedPet.qrCode = qrCode;
            await savedPet.save();
            
            ResponseHandler.created(res, "Mascota creada exitosamente", savedPet);
        } catch (error) {
            ResponseHandler.error(res, 400, error.message);
        }
    }
);

// Get all pets (Admin sees all, owners see only their pets)
router.get('/', authenticateToken, canViewOwnPets, async (req, res) => {
    try {
        let pets;
        if (req.user.userType === USER_TYPES.ADMIN) {
            pets = await Pet.find();
        } else {
            pets = await Pet.find({ ownerId: req.user.id });
        }
        
        if (pets.length === 0) {
            return ResponseHandler.emptyList(res, "No se encontraron mascotas");
        }
        
        ResponseHandler.success(res, 200, "Mascotas obtenidas exitosamente", pets);
    } catch (error) {
        ResponseHandler.error(res, 500, error.message);
    }
});

// Get pets for authenticated user (from token)
router.get('/my-pets', authenticateToken, async (req, res) => {
    try {
        const pets = await Pet.find({ ownerId: req.user.id });
        
        if (pets.length === 0) {
            return ResponseHandler.emptyList(res, "No se encontraron mascotas");
        }
        
        ResponseHandler.success(res, 200, "Mascotas obtenidas exitosamente", pets);
    } catch (error) {
        ResponseHandler.error(res, 500, error.message);
    }
});

// Get pets by ownerId
router.get('/owner/:ownerId', authenticateToken, async (req, res) => {
    try {
        const { ownerId } = req.params;
        
        if (req.user.userType !== USER_TYPES.ADMIN && req.user.id !== ownerId) {
            return ResponseHandler.forbidden(res, 'Solo puedes ver tus propias mascotas');
        }
        
        const pets = await Pet.find({ ownerId: ownerId });
        
        if (pets.length === 0) {
            return ResponseHandler.emptyList(res, "No se encontraron mascotas para este dueño");
        }
        
        ResponseHandler.success(res, 200, "Mascotas obtenidas exitosamente", pets);
    } catch (error) {
        ResponseHandler.error(res, 500, error.message);
    }
});

// Get view history for a specific pet
router.get('/:id/history', authenticateToken, canViewPet, async (req, res) => {
    try {
        const pet = req.pet || await findPetById(req.params.id);
        
        if (!pet) {
            return ResponseHandler.notFound(res, 'Mascota');
        }
        
        ResponseHandler.success(res, 200, "Historial obtenido exitosamente", {
            petId: pet._id,
            uniqueId: pet.uniqueId,
            name: pet.name,
            viewHistory: pet.viewHistory
        });
    } catch (error) {
        ResponseHandler.error(res, 500, error.message);
    }
});

// Get a specific pet (Public access, but tracks view history)
router.get('/:id', async (req, res) => {
    try {
        const pet = await findPetById(req.params.id);
        
        if (!pet) {
            return ResponseHandler.notFound(res, 'Mascota');
        }
        
        // Get IP information
        const ipInfo = await geoLocationService.getIpInfo(req.ip || req.socket.remoteAddress);
        
        // Add view history
        await addViewHistory(pet, req, ipInfo);
        
        ResponseHandler.success(res, 200, "Mascota obtenida exitosamente", pet);
    } catch (error) {
        ResponseHandler.error(res, 500, error.message);
    }
});

// Update a pet
router.put('/:id', 
    authenticateToken, 
    canEditOwnPet,
    ValidationUtils.validateRequest(ValidationUtils.validatePetUpdate),
    async (req, res) => {
        try {
            const pet = req.pet || await findPetById(req.params.id);
            
            if (!pet) {
                return ResponseHandler.notFound(res, 'Mascota');
            }

            const updateData = {
                ...req.body,
                lastModifiedBy: req.user.name || req.user.username || "Sistema",
                lastModifiedAt: new Date()
            };
            
            const updatedPet = await Pet.findByIdAndUpdate(
                pet._id,
                updateData,
                { new: true, runValidators: true }
            );

            ResponseHandler.updated(res, "Mascota actualizada exitosamente", updatedPet);
        } catch (error) {
            ResponseHandler.error(res, 400, error.message);
        }
    }
);

// Delete a pet (Admin only)
router.delete('/:id', authenticateToken, requirePermission('canDeleteAllPets'), async (req, res) => {
    try {
        const pet = await findPetById(req.params.id);
        
        if (!pet) {
            return ResponseHandler.notFound(res, 'Mascota');
        }
        
        await Pet.findByIdAndDelete(pet._id);
        
        ResponseHandler.deleted(res, "Mascota eliminada correctamente");
    } catch (error) {
        ResponseHandler.error(res, 500, error.message);
    }
});

module.exports = router; 