const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

class GeoLocationService {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 24 * 60 * 60 * 1000; // 24 hours
    }

    /**
     * Get IP information with caching
     * @param {string} ip - IP address
     * @returns {Promise<Object>} - IP information
     */
    async getIpInfo(ip) {
        try {
            // Check cache first
            const cached = this.getFromCache(ip);
            if (cached) {
                return cached;
            }

            // Fetch from API
            const response = await fetch(`https://ipwho.is/${ip}`, {
                timeout: 5000, // 5 second timeout
                headers: {
                    'User-Agent': 'PetManagementAPI/1.0'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success) {
                const ipInfo = {
                    country: data.country || 'unknown',
                    city: data.city || 'unknown',
                    region: data.region || 'unknown',
                    coordinates: {
                        latitude: data.latitude || null,
                        longitude: data.longitude || null
                    },
                    timezone: data.timezone?.id || 'unknown',
                    isp: data.connection?.isp || 'unknown'
                };

                // Cache the result
                this.setCache(ip, ipInfo);
                return ipInfo;
            } else {
                return this.getDefaultIpInfo();
            }
        } catch (error) {
            console.error('Error fetching IP info:', error);
            return this.getDefaultIpInfo();
        }
    }

    /**
     * Get default IP info for fallback
     * @returns {Object} - Default IP information
     */
    getDefaultIpInfo() {
        return {
            country: 'unknown',
            city: 'unknown',
            region: 'unknown',
            coordinates: {
                latitude: null,
                longitude: null
            },
            timezone: 'unknown',
            isp: 'unknown'
        };
    }

    /**
     * Get from cache
     * @param {string} ip - IP address
     * @returns {Object|null} - Cached data or null
     */
    getFromCache(ip) {
        const cached = this.cache.get(ip);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        this.cache.delete(ip);
        return null;
    }

    /**
     * Set cache
     * @param {string} ip - IP address
     * @param {Object} data - Data to cache
     */
    setCache(ip, data) {
        this.cache.set(ip, {
            data,
            timestamp: Date.now()
        });

        // Clean old entries if cache gets too large
        if (this.cache.size > 1000) {
            const now = Date.now();
            for (const [key, value] of this.cache.entries()) {
                if (now - value.timestamp > this.cacheTimeout) {
                    this.cache.delete(key);
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
}

module.exports = new GeoLocationService(); 