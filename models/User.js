const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: { 
        type: Number, 
        required: true, 
        enum: [1, 2], 
        default: 2 
    }, // 1 = admin, 2 = pet owner
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema); 