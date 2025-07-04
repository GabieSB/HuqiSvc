const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Test MongoDB connection
 */
async function testMongoDBConnection() {
    console.log('🔍 Testing MongoDB connection...\n');
    
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
        console.error('❌ MONGODB_URI environment variable is not set');
        console.log('Please set MONGODB_URI in your .env file or environment variables');
        process.exit(1);
    }
    
    console.log('📋 Connection string (masked):');
    console.log(mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    console.log('');
    
    try {
        // Connect to MongoDB
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        
        console.log('✅ Successfully connected to MongoDB!');
        console.log(`📊 Database: ${mongoose.connection.name}`);
        console.log(`🌐 Host: ${mongoose.connection.host}`);
        console.log(`🔌 Port: ${mongoose.connection.port}`);
        console.log(`👤 User: ${mongoose.connection.user}`);
        
        // Test a simple operation
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`📚 Collections found: ${collections.length}`);
        
        if (collections.length > 0) {
            console.log('Collections:');
            collections.forEach(col => console.log(`  - ${col.name}`));
        }
        
        // Close connection
        await mongoose.connection.close();
        console.log('\n✅ Connection test completed successfully!');
        
    } catch (error) {
        console.error('❌ MongoDB connection failed:');
        console.error(error.message);
        
        if (error.name === 'MongoServerSelectionError') {
            console.log('\n💡 Troubleshooting tips:');
            console.log('1. Check if your MongoDB Atlas cluster is running');
            console.log('2. Verify your IP address is whitelisted in Network Access');
            console.log('3. Check your username and password');
            console.log('4. Ensure your connection string format is correct');
        }
        
        process.exit(1);
    }
}

// Run the test
testMongoDBConnection(); 