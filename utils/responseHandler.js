const { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../config/constants');

class ResponseHandler {
    /**
     * Send success response
     * @param {Object} res - Express response object
     * @param {number} statusCode - HTTP status code
     * @param {string} message - Success message
     * @param {*} data - Response data
     */
    static success(res, statusCode = HTTP_STATUS.OK, message = '', data = null) {
        return res.status(statusCode).json({
            success: true,
            message,
            data
        });
    }

    /**
     * Send error response
     * @param {Object} res - Express response object
     * @param {number} statusCode - HTTP status code
     * @param {string} message - Error message
     * @param {*} data - Error data (usually null)
     */
    static error(res, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, message = ERROR_MESSAGES.INTERNAL_ERROR, data = null) {
        return res.status(statusCode).json({
            success: false,
            message,
            data
        });
    }

    /**
     * Send not found response
     * @param {Object} res - Express response object
     * @param {string} resource - Resource name
     */
    static notFound(res, resource = 'Recurso') {
        return this.error(res, HTTP_STATUS.NOT_FOUND, `${resource} no encontrado`);
    }

    /**
     * Send unauthorized response
     * @param {Object} res - Express response object
     * @param {string} message - Custom message
     */
    static unauthorized(res, message = ERROR_MESSAGES.UNAUTHORIZED) {
        return this.error(res, HTTP_STATUS.UNAUTHORIZED, message);
    }

    /**
     * Send forbidden response
     * @param {Object} res - Express response object
     * @param {string} message - Custom message
     */
    static forbidden(res, message = ERROR_MESSAGES.FORBIDDEN) {
        return this.error(res, HTTP_STATUS.FORBIDDEN, message);
    }

    /**
     * Send validation error response
     * @param {Object} res - Express response object
     * @param {string} message - Validation message
     */
    static validationError(res, message = ERROR_MESSAGES.VALIDATION_ERROR) {
        return this.error(res, HTTP_STATUS.BAD_REQUEST, message);
    }

    /**
     * Send created response
     * @param {Object} res - Express response object
     * @param {string} message - Success message
     * @param {*} data - Created data
     */
    static created(res, message = SUCCESS_MESSAGES.CREATED, data = null) {
        return this.success(res, HTTP_STATUS.CREATED, message, data);
    }

    /**
     * Send updated response
     * @param {Object} res - Express response object
     * @param {string} message - Success message
     * @param {*} data - Updated data
     */
    static updated(res, message = SUCCESS_MESSAGES.UPDATED, data = null) {
        return this.success(res, HTTP_STATUS.OK, message, data);
    }

    /**
     * Send deleted response
     * @param {Object} res - Express response object
     * @param {string} message - Success message
     */
    static deleted(res, message = SUCCESS_MESSAGES.DELETED) {
        return this.success(res, HTTP_STATUS.OK, message, null);
    }

    /**
     * Send empty list response
     * @param {Object} res - Express response object
     * @param {string} message - Empty list message
     */
    static emptyList(res, message = 'No se encontraron elementos') {
        return this.success(res, HTTP_STATUS.OK, message, []);
    }
}

module.exports = ResponseHandler; 