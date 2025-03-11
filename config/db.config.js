const mongoose = require('mongoose');
const constants = require('../constants');  // Import constants from the root directory
require('dotenv').config(); // Load environment variables

const dbConnect = async () => {
    try {
        const uri = `${process.env.MONGO_URI}/${constants.DB_NAME}`;
        await mongoose.connect(uri);
        const dbName = mongoose.connection.db.databaseName;
        console.log(`MongoDB connected to database: ${dbName}`);
    } catch (err) {
        console.error('Database connection error:', err.message);
        process.exit(1); // Exit process on failure
    }
};

module.exports = dbConnect;
