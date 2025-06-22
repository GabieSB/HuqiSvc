const mongoose = require('mongoose');

const permissions = {
    1: { // Admin
        canManageUsers: true,
        canManageAllPets: true,
        canViewAllPets: true,
        canEditAllPets: true,
        canDeleteAllPets: true,
        canViewDashboard: true,
        canViewUserManagement: true
    },
    2: { // Dueño de Mascota
        canManageUsers: false,
        canManageAllPets: false,
        canViewAllPets: false,
        canEditAllPets: false,
        canDeleteAllPets: false,
        canViewDashboard: true,
        canViewUserManagement: false,
        canViewOwnPets: true,
        canEditOwnPets: true
    }
};

// Check user permission
const checkUserPermission = (userType, permission) => {
    return permissions[userType]?.[permission] || false;
};

// Middleware to check specific permission
const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: 'Autenticación requerida',
                data: null
            });
        }

        const hasPermission = checkUserPermission(req.user.userType, permission);
        if (!hasPermission) {
            return res.status(403).json({ 
                success: false,
                message: 'Permisos insuficientes',
                data: null
            });
        }

        next();
    };
};

// Middleware to check if user can edit their own pet
const canEditOwnPet = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ 
            success: false,
            message: 'Autenticación requerida',
            data: null
        });
    }

    // Admin can edit any pet
    if (req.user.userType === 1) {
        return next();
    }

    // Pet owners can only edit their own pets
    if (req.user.userType === 2) {
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
                    message: 'Solo puedes editar tus propias mascotas',
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
    } else {
        return res.status(403).json({ 
            success: false,
            message: 'Tipo de usuario inválido',
            data: null
        });
    }
};

// Middleware to check if user can view their own pets
const canViewOwnPets = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ 
            success: false,
            message: 'Autenticación requerida',
            data: null
        });
    }

    // Admin can view all pets
    if (req.user.userType === 1) {
        return next();
    }

    // Pet owners can only view their own pets
    if (req.user.userType === 2) {
        return next(); // The filtering will be done in the route handler
    }

    return res.status(403).json({ 
        success: false,
        message: 'Tipo de usuario inválido',
        data: null
    });
};

// Middleware to check if user can view specific pet
const canViewPet = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ 
            success: false,
            message: 'Autenticación requerida',
            data: null
        });
    }

    // Admin can view any pet
    if (req.user.userType === 1) {
        return next();
    }

    // Pet owners can only view their own pets
    if (req.user.userType === 2) {
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
                    message: 'Solo puedes ver tus propias mascotas',
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
    } else {
        return res.status(403).json({ 
            success: false,
            message: 'Tipo de usuario inválido',
            data: null
        });
    }
};

module.exports = {
    checkUserPermission,
    requirePermission,
    canEditOwnPet,
    canViewOwnPets,
    canViewPet,
    permissions
}; 