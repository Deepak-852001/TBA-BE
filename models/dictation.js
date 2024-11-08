const mongoose = require('mongoose');

// Define the User schema
const dictationSchema = new mongoose.Schema({
    level: {
        type: String, 
        required: true,
    },
    questions: {
        type: [{
            question: {
                type: [Number], // Array of numbers
                required: true
            },
            answer: {
                type: Number, // Number for the answer
                required: true
            }
        }],
        _id: false,
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now // Automatically set the date when the user is created
    }

});

// Create the User model from the schema
const Dictation = mongoose.model('Dictation', dictationSchema);

module.exports = Dictation; // Export the User model