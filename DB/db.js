// Import required modules
const mongoose = require('mongoose');
require('dotenv').config(); // To use environment variables

console.log("ji")
// MongoDB connection URL
const mongoDBUrl = process.env.MONGODB_URL;

// Connect to MongoDB
mongoose.connect(mongoDBUrl)
.then(() => {
    console.log('MongoDB connected successfully');
})
.catch(err => {
    console.error('MongoDB connection error:', err);
});