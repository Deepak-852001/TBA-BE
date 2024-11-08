const mongoose = require('mongoose');

// Define the User schema
const userSchema = new mongoose.Schema({
    studentName: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    currentLevel: {
        type: String,
        required: true,
    },
    centerName: {
        type: String,
        required: true,
    },
    emailId: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^\S+@\S+\.\S+$/.test(v); // Validate to ensure the format of the email
            },
            message: props => `${props.value} is not a valid email address!`
        }
    },
    OTP: {
        type: Number,
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now // Automatically set the date when the user is created
    }

});

// Create the User model from the schema
const User = mongoose.model('User', userSchema);

module.exports = User; // Export the User model