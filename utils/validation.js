const { VALIDATION, SECURITY } = require('../config/constants');
const ResponseHandler = require('./responseHandler');

class ValidationUtils {
    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} - Is valid email
     */
    static isValidEmail(email) {
        return VALIDATION.EMAIL_REGEX.test(email);
    }

    /**
     * Validate password strength
     * @param {string} password - Password to validate
     * @returns {boolean} - Is valid password
     */
    static isValidPassword(password) {
        return VALIDATION.PASSWORD_REGEX.test(password);
    }

    /**
     * Validate phone number format
     * @param {string} phone - Phone to validate
     * @returns {boolean} - Is valid phone
     */
    static isValidPhone(phone) {
        return VALIDATION.PHONE_REGEX.test(phone);
    }

    /**
     * Validate MongoDB ObjectId
     * @param {string} id - ID to validate
     * @returns {boolean} - Is valid ObjectId
     */
    static isValidObjectId(id) {
        return VALIDATION.OBJECT_ID_REGEX.test(id);
    }

    /**
     * Sanitize string input
     * @param {string} input - Input to sanitize
     * @returns {string} - Sanitized string
     */
    static sanitizeString(input) {
        if (typeof input !== 'string') return '';
        return input.trim().replace(/[<>]/g, '');
    }

    /**
     * Sanitize object properties
     * @param {Object} obj - Object to sanitize
     * @returns {Object} - Sanitized object
     */
    static sanitizeObject(obj) {
        if (!obj || typeof obj !== 'object') return {};
        
        // Handle arrays
        if (Array.isArray(obj)) {
            return obj.map(item => {
                if (typeof item === 'string') {
                    return ValidationUtils.sanitizeString(item);
                } else if (typeof item === 'object' && item !== null) {
                    return ValidationUtils.sanitizeObject(item);
                } else {
                    return item;
                }
            });
        }
        
        // Handle objects
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'string') {
                sanitized[key] = ValidationUtils.sanitizeString(value);
            } else if (Array.isArray(value)) {
                sanitized[key] = ValidationUtils.sanitizeObject(value);
            } else if (typeof value === 'object' && value !== null) {
                sanitized[key] = ValidationUtils.sanitizeObject(value);
            } else {
                sanitized[key] = value;
            }
        }
        return sanitized;
    }

    /**
     * Validate user registration data
     * @param {Object} userData - User data to validate
     * @returns {Object} - Validation result
     */
    static validateUserRegistration(userData) {
        const errors = [];

        if (!userData.username || userData.username.length < SECURITY.USERNAME_MIN_LENGTH) {
            errors.push(`El nombre de usuario debe tener al menos ${SECURITY.USERNAME_MIN_LENGTH} caracteres`);
        }

        if (!userData.email || !ValidationUtils.isValidEmail(userData.email)) {
            errors.push('Email inválido');
        }

        if (!userData.password || !ValidationUtils.isValidPassword(userData.password)) {
            errors.push(`La contraseña debe tener al menos ${SECURITY.PASSWORD_MIN_LENGTH} caracteres`);
        }

        if (userData.userType && ![1, 2].includes(userData.userType)) {
            errors.push('Tipo de usuario inválido');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate pet data
     * @param {Object} petData - Pet data to validate
     * @returns {Object} - Validation result
     */
    static validatePetData(petData) {
        const errors = [];

        if (!petData.name || petData.name.length < SECURITY.PET_NAME_MIN_LENGTH) {
            errors.push(`El nombre de la mascota debe tener al menos ${SECURITY.PET_NAME_MIN_LENGTH} caracteres`);
        }

        if (!petData.owner || petData.owner.length < SECURITY.OWNER_NAME_MIN_LENGTH) {
            errors.push(`El nombre del propietario debe tener al menos ${SECURITY.OWNER_NAME_MIN_LENGTH} caracteres`);
        }

        if (!petData.species || petData.species.length < SECURITY.SPECIES_MIN_LENGTH) {
            errors.push(`La especie debe tener al menos ${SECURITY.SPECIES_MIN_LENGTH} caracteres`);
        }

        if (!petData.zone || petData.zone.length < SECURITY.ZONE_MIN_LENGTH) {
            errors.push(`La zona debe tener al menos ${SECURITY.ZONE_MIN_LENGTH} caracteres`);
        }

        if (!petData.birthdate) {
            errors.push('La fecha de nacimiento es requerida');
        }

        // Validate phone array
        if (!petData.phone || !Array.isArray(petData.phone) || petData.phone.length === 0) {
            errors.push('Debe proporcionar al menos un número de teléfono');
        } else {
            petData.phone.forEach((phoneEntry, index) => {
                // Remove _id if present (should not be sent from frontend)
                if (phoneEntry._id) {
                    delete phoneEntry._id;
                }
                
                if (!phoneEntry.owner || phoneEntry.owner.length < SECURITY.PHONE_OWNER_MIN_LENGTH) {
                    errors.push(`El propietario del teléfono ${index + 1} debe tener al menos ${SECURITY.PHONE_OWNER_MIN_LENGTH} caracteres`);
                }
                if (!phoneEntry.number || !ValidationUtils.isValidPhone(phoneEntry.number)) {
                    errors.push(`El número de teléfono ${index + 1} no es válido`);
                }
            });
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate login data
     * @param {Object} loginData - Login data to validate
     * @returns {Object} - Validation result
     */
    static validateLoginData(loginData) {
        const errors = [];

        if (!loginData.email || !ValidationUtils.isValidEmail(loginData.email)) {
            errors.push('Email inválido');
        }

        if (!loginData.password || loginData.password.trim().length === 0) {
            errors.push('Contraseña requerida');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate pet data for updates
     * @param {Object} petData - Pet data to validate
     * @returns {Object} - Validation result
     */
    static validatePetUpdate(petData) {
        console.log('🔍 Validating pet UPDATE data - Keys:', Object.keys(petData));
        console.log('🔍 Phone field exists:', 'phone' in petData);
        console.log('🔍 Phone field value:', petData.phone);
        
        const errors = [];

        if (!petData.name || petData.name.length < SECURITY.PET_NAME_MIN_LENGTH) {
            errors.push(`El nombre de la mascota debe tener al menos ${SECURITY.PET_NAME_MIN_LENGTH} caracteres`);
        }

        if (!petData.owner || petData.owner.length < SECURITY.OWNER_NAME_MIN_LENGTH) {
            errors.push(`El nombre del propietario debe tener al menos ${SECURITY.OWNER_NAME_MIN_LENGTH} caracteres`);
        }

        if (!petData.species || petData.species.length < SECURITY.SPECIES_MIN_LENGTH) {
            errors.push(`La especie debe tener al menos ${SECURITY.SPECIES_MIN_LENGTH} caracteres`);
        }

        if (!petData.zone || petData.zone.length < SECURITY.ZONE_MIN_LENGTH) {
            errors.push(`La zona debe tener al menos ${SECURITY.ZONE_MIN_LENGTH} caracteres`);
        }

        if (!petData.birthdate) {
            errors.push('La fecha de nacimiento es requerida');
        }

        // Validate phone array for updates
        console.log('📞 Phone validation for UPDATE:');
        console.log('📞 petData.phone:', petData.phone);
        console.log('📞 typeof petData.phone:', typeof petData.phone);
        console.log('📞 Array.isArray(petData.phone):', Array.isArray(petData.phone));
        console.log('📞 petData.phone.length:', petData.phone ? petData.phone.length : 'undefined');
        
        if (!petData.phone || !Array.isArray(petData.phone) || petData.phone.length === 0) {
            console.log('❌ Phone validation failed - phone is:', petData.phone);
            errors.push('Debe proporcionar al menos un número de teléfono');
        } else {
            petData.phone.forEach((phoneEntry, index) => {
                console.log(`📞 Validating phone entry ${index}:`, phoneEntry);
                // For updates, we need to validate the content but keep existing _id
                if (!phoneEntry.owner || phoneEntry.owner.length < SECURITY.PHONE_OWNER_MIN_LENGTH) {
                    errors.push(`El propietario del teléfono ${index + 1} debe tener al menos ${SECURITY.PHONE_OWNER_MIN_LENGTH} caracteres`);
                }
                if (!phoneEntry.number || !ValidationUtils.isValidPhone(phoneEntry.number)) {
                    errors.push(`El número de teléfono ${index + 1} no es válido`);
                }
            });
        }

        console.log('❌ UPDATE Validation errors:', errors);
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Middleware to validate request body
     * @param {Function} validator - Validation function
     * @returns {Function} - Express middleware
     */
    static validateRequest(validator) {
        return (req, res, next) => {
            console.log('🔍 Validation middleware - Raw body keys:', Object.keys(req.body));
            console.log('🔍 Validation middleware - Raw body phone:', req.body.phone);
            console.log('🔍 Validation middleware - Raw body phone type:', typeof req.body.phone);
            console.log('🔍 Validation middleware - Raw body phone isArray:', Array.isArray(req.body.phone));
            
            const sanitizedBody = ValidationUtils.sanitizeObject(req.body);
            console.log('🔍 Validation middleware - Sanitized body keys:', Object.keys(sanitizedBody));
            console.log('🔍 Validation middleware - Sanitized body phone:', sanitizedBody.phone);
            console.log('🔍 Validation middleware - Sanitized body phone type:', typeof sanitizedBody.phone);
            console.log('🔍 Validation middleware - Sanitized body phone isArray:', Array.isArray(sanitizedBody.phone));
            
            req.body = sanitizedBody;

            const validation = validator(sanitizedBody);
            console.log('🔍 Validation middleware - Validation result:', validation);
            
            if (!validation.isValid) {
                return ResponseHandler.validationError(res, validation.errors.join(', '));
            }

            next();
        };
    }
}

module.exports = ValidationUtils; 