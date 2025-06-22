const QRCode = require('qrcode');
const { SECURITY } = require('../config/constants');

class QRCodeService {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 7 * 24 * 60 * 60 * 1000; // 7 days
        this.defaultOptions = {
            errorCorrectionLevel: 'H',
            margin: 1,
            width: 300,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        };
    }

    /**
     * Generate QR code for pet
     * @param {string} uniqueId - Pet unique ID
     * @param {string} baseUrl - Base URL for pet links
     * @param {Object} options - QR code options
     * @returns {Promise<string>} - QR code data URL
     */
    async generateQRCode(uniqueId, baseUrl, options = {}) {
        try {
            // Check cache first
            const cacheKey = `${uniqueId}_${baseUrl}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) {
                return cached;
            }

            // Generate pet URL
            const petUrl = `${baseUrl}/${uniqueId}`;
            
            // Merge options
            const qrOptions = { ...this.defaultOptions, ...options };
            
            // Generate QR code
            const qrCodeDataUrl = await QRCode.toDataURL(petUrl, qrOptions);
            
            // Cache the result
            this.setCache(cacheKey, qrCodeDataUrl);
            
            return qrCodeDataUrl;
        } catch (error) {
            console.error('Error generating QR code:', error);
            throw new Error('Error generando código QR');
        }
    }

    /**
     * Generate QR code with custom data
     * @param {string} data - Data to encode
     * @param {Object} options - QR code options
     * @returns {Promise<string>} - QR code data URL
     */
    async generateCustomQRCode(data, options = {}) {
        try {
            const qrOptions = { ...this.defaultOptions, ...options };
            return await QRCode.toDataURL(data, qrOptions);
        } catch (error) {
            console.error('Error generating custom QR code:', error);
            throw new Error('Error generando código QR personalizado');
        }
    }

    /**
     * Get QR code as buffer
     * @param {string} data - Data to encode
     * @param {Object} options - QR code options
     * @returns {Promise<Buffer>} - QR code buffer
     */
    async generateQRCodeBuffer(data, options = {}) {
        try {
            const qrOptions = { ...this.defaultOptions, ...options };
            return await QRCode.toBuffer(data, qrOptions);
        } catch (error) {
            console.error('Error generating QR code buffer:', error);
            throw new Error('Error generando buffer del código QR');
        }
    }

    /**
     * Get from cache
     * @param {string} key - Cache key
     * @returns {string|null} - Cached data or null
     */
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        this.cache.delete(key);
        return null;
    }

    /**
     * Set cache
     * @param {string} key - Cache key
     * @param {string} data - Data to cache
     */
    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });

        // Clean old entries if cache gets too large
        if (this.cache.size > 500) {
            const now = Date.now();
            for (const [cacheKey, value] of this.cache.entries()) {
                if (now - value.timestamp > this.cacheTimeout) {
                    this.cache.delete(cacheKey);
                }
            }
        }
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Get cache statistics
     * @returns {Object} - Cache statistics
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            timeout: this.cacheTimeout
        };
    }

    /**
     * Validate QR code data
     * @param {string} data - Data to validate
     * @returns {boolean} - Is valid data
     */
    validateQRData(data) {
        return typeof data === 'string' && data.length > 0 && data.length <= 2953; // QR code max capacity
    }
}

module.exports = new QRCodeService(); 