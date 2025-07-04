const fetch = require('node-fetch');

/**
 * Health check script for monitoring deployed API
 */
async function healthCheck(baseUrl) {
    const url = `${baseUrl}/health`;
    
    try {
        console.log(`🔍 Checking health at: ${url}`);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 10000 // 10 second timeout
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data.status === 'healthy') {
            console.log('✅ API is healthy!');
            console.log(`📊 Database: ${data.data.database}`);
            console.log(`⏰ Uptime: ${Math.round(data.data.uptime)}s`);
            console.log(`🕐 Timestamp: ${data.data.timestamp}`);
            return true;
        } else {
            console.log('❌ API health check failed');
            console.log('Response:', data);
            return false;
        }
        
    } catch (error) {
        console.error('❌ Health check failed:', error.message);
        return false;
    }
}

// If run directly, use command line argument or default
if (require.main === module) {
    const baseUrl = process.argv[2] || 'http://localhost:3000';
    healthCheck(baseUrl)
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('Health check error:', error);
            process.exit(1);
        });
}

module.exports = healthCheck; 