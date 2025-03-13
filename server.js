// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const client = require('./db'); // Importing the db connection
const authenticateJWT = require('./middleware/auth'); // Importing the authentication middleware

// Importing route files
// Importing route files
const fileRoute = require('./route/fileroutes');
const folderRoute = require('./route/folderroute'); 
const authRoute = require('./route/authroute');
const faq  = require('./route/faqroute');



const app = express();


// Debugging log to check if JWT_SECRET is loaded
console.log("JWT_SECRET:", process.env.JWT_SECRET);

// Enable CORS for all routes
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'DELETE'],
    preflightContinue: true,
}));

app.options('*', cors());

// Other middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Using the routes
app.use('/api/files', fileRoute);      // Route for file operations
app.use('/api/folders', folderRoute);  // Route for folder operations
app.use('/api/auth', authRoute);       // Route for authentication
app.use('/api', faq);       // Route for authentication



// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
