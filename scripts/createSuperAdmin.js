require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

const dbConnect = require('../config/db.config');

const createSuperAdmin = async () => {
    try {
        await dbConnect();

        const email = 'abhishek.kushwaha@jagrannewmedia.com';
        const password = 'abhiKushwaha$8234';
        const hashedPassword = await bcrypt.hash(password, 10);

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            console.log('Super Admin already exists');
            return;
        }

        const superAdmin = new User({
            email,
            password: hashedPassword,
            role: 'super_admin'
        });

        await superAdmin.save();
        console.log('Super Admin created successfully');
        mongoose.connection.close();
    } catch (err) {
        console.error('Error creating Super Admin:', err);
    }
};
//node scripts/createSuperAdmin.js

createSuperAdmin();
