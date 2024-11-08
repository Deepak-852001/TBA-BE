const mongoose = require('mongoose');

// Define the User schema
const flashCardSchema = new mongoose.Schema({
    level: {
        type: String, 
        required: true,
    },
    imageUrl: {
        type: [String],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now // Automatically set the date when the user is created
    }

});

// Create the User model from the schema
const FlashCard = mongoose.model('FlashCard', flashCardSchema);

module.exports = FlashCard; // Export the User model