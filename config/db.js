const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            autoIndex: process.env.NODE_ENV !== 'production' // Avoid build overhead in prod
        });

        console.log(`[MongoDB] Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`[MongoDB Error] ${error.message}`);
        process.exit(1);
    }
};

mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] Connection lost. Attempting reconnect...');
});

module.exports = connectDB;