const crypto = require('crypto');

/**
 * Generate secure environment variables for production
 */
function generateSecureSecret(length = 64) {
    return crypto.randomBytes(length).toString('hex');
}

console.log('🔐 Generating secure environment variables for production...\n');

const jwtSecret = generateSecureSecret(32);
console.log('JWT_SECRET:');
console.log(jwtSecret);
console.log('\n📋 Copy these values to your Vercel environment variables:\n');

console.log('Required Environment Variables:');
console.log('==============================');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log('MONGODB_URI=your_mongodb_atlas_connection_string');
console.log('BASE_URL=https://your-app-name.vercel.app');

console.log('\n📝 Instructions:');
console.log('1. Go to your Vercel project dashboard');
console.log('2. Navigate to Settings → Environment Variables');
console.log('3. Add each variable with the values above');
console.log('4. Make sure to set them for Production environment');
console.log('5. Redeploy your application after adding the variables');

console.log('\n⚠️  Security Notes:');
console.log('- Never commit these values to Git');
console.log('- Use different secrets for each environment');
console.log('- Rotate secrets regularly in production');
console.log('- Keep your MongoDB connection string secure'); 