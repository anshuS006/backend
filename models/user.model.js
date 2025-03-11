const mongoose = require('mongoose');

// Define the schema for the User model
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['super_admin', 'admin', 'author','user'],
        default: 'user',
    },
    active: { 
        type: Boolean, 
        default: true // New field to track user status
    },
    subscriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, {
    timestamps: true, // Adds createdAt and updatedAt fields
});

// Create the User model using the schema
const User = mongoose.model('User', userSchema);

module.exports = User;
