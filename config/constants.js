// User Types
const USER_TYPES = {
    ADMIN: 1,
    PET_OWNER: 2
};

// HTTP Status Codes
const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
};

// Permission Types
const PERMISSIONS = {
    CAN_MANAGE_USERS: 'canManageUsers',
    CAN_MANAGE_ALL_PETS: 'canManageAllPets',
    CAN_VIEW_ALL_PETS: 'canViewAllPets',
    CAN_EDIT_ALL_PETS: 'canEditAllPets',
    CAN_DELETE_ALL_PETS: 'canDeleteAllPets',
    CAN_VIEW_DASHBOARD: 'canViewDashboard',
    CAN_VIEW_USER_MANAGEMENT: 'canViewUserManagement',
    CAN_VIEW_OWN_PETS: 'canViewOwnPets',
    CAN_EDIT_OWN_PETS: 'canEditOwnPets',
    CAN_DELETE_ALL_USERS: 'canDeleteAllUsers'
};

// Security Constants
const SECURITY = {
    BCRYPT_ROUNDS: 12,
    JWT_EXPIRES_IN: '24h',
    RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: 1000, // Increased from 100 to 1000
    RATE_LIMIT_AUTH_MAX_REQUESTS: 50, // Specific limit for auth endpoints
    RATE_LIMIT_CREATE_MAX_REQUESTS: 100, // Specific limit for create operations
    PASSWORD_MIN_LENGTH: 4,
    USERNAME_MIN_LENGTH: 3,
    PET_NAME_MIN_LENGTH: 2,
    OWNER_NAME_MIN_LENGTH: 2,
    SPECIES_MIN_LENGTH: 2,
    ZONE_MIN_LENGTH: 2,
    PHONE_OWNER_MIN_LENGTH: 2,
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION_MS: 15 * 60 * 1000 // 15 minutes
};

// Validation Patterns
const VALIDATION = {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD_REGEX: /^.{4,}$/,
    PHONE_REGEX: /^\+?[\d\s\-\(\)]+$/,
    OBJECT_ID_REGEX: /^[0-9a-fA-F]{24}$/
};

// API Endpoints
const ENDPOINTS = {
    PETS: '/api/pets',
    USERS: '/api/users',
    AUTH: '/api/auth'
};

// Error Messages
const ERROR_MESSAGES = {
    UNAUTHORIZED: 'No autorizado',
    FORBIDDEN: 'Acceso denegado',
    NOT_FOUND: 'Recurso no encontrado',
    VALIDATION_ERROR: 'Error de validación',
    INTERNAL_ERROR: 'Error interno del servidor',
    INVALID_CREDENTIALS: 'Credenciales inválidas',
    USER_NOT_FOUND: 'Usuario no encontrado',
    PET_NOT_FOUND: 'Mascota no encontrada',
    INSUFFICIENT_PERMISSIONS: 'Permisos insuficientes',
    RATE_LIMIT_EXCEEDED: 'Demasiadas solicitudes, intente más tarde'
};

// Success Messages
const SUCCESS_MESSAGES = {
    CREATED: 'Creado exitosamente',
    UPDATED: 'Actualizado exitosamente',
    DELETED: 'Eliminado exitosamente',
    LOGIN_SUCCESS: 'Login exitoso',
    REGISTER_SUCCESS: 'Registro exitoso'
};

module.exports = {
    USER_TYPES,
    HTTP_STATUS,
    PERMISSIONS,
    SECURITY,
    VALIDATION,
    ENDPOINTS,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES
}; 