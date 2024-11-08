const express = require('express');
const cors = require('cors'); // Import the cors package
const app = express();
const port = 3000; // Port number you can change if needed
const db = require("./DB/db")

// Import routes
const userRoutes = require("./routes/user.js");
const addQuestionRoutes = require('./routes/addQuestion.js');

// Enable CORS for all routes
app.use(cors()); // This will allow all origins by default

// Middleware to parse JSON requests
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
    res.send('Welcome to SIP Abacus THE BEAD APP');
});

// Use routes for user and questions
app.use("/", userRoutes);
app.use("/question", addQuestionRoutes);

// Error handling middleware (optional but recommended)
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

// General error handler (this is for any other errors)
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
