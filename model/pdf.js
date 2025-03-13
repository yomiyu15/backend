// pdfModel.js
const { Pool } = require('pg');

// Configure PostgreSQL connection
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Product2',
    password: 'yoomii0929',
    port: 5432,
});

// Function to save a PDF to the database

const checkConnection = async () => {
    try {
        await pool.query('SELECT NOW()'); // Simple query to check the connection
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection error:', error.stack);
    }
};

// Call the checkConnection function
checkConnection();

// Existing savePdf and getPdf functions...
module.exports = { checkConnection};
