const { Client } = require('pg');

// Create a new client instance
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'Product2',
    password: 'yoomii0929',
    port: 5432,
});

const connectDb = async () => {
    try {
        // Establish connection to the database
        await client.connect();
        console.log('Connected to PostgreSQL database');
    } catch (err) {
        console.error('Database connection error', err.stack);
    }
};

// Call the connection function
connectDb();

// Export the client so it can be used in other parts of the application
module.exports = client;
