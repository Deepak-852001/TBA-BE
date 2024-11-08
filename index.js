const express = require('express');
const app = express();
const port = 3000; // You can change this port number if needed
const db = require("./DB/db")
const userRoutes = require("./routes/user.js")
const addQuestionRoutes = require('./routes/addQuestion.js')

// Middleware to parse JSON requests
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
    res.send('Welcome to SIP Abacus THE BEAD APP');
});

app.use("/", userRoutes)
app.use("/question", addQuestionRoutes)

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});