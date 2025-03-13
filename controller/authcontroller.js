const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const client = require('../db'); // Importing the client from db.js

// User registration endpoint
exports.register = async (req, res) => {
    const { username, password, isAdmin = false } = req.body; // Default isAdmin to false

    // Validate input
    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    try {
        // Check if the client is properly initialized
        if (!client._connected) {
            return res.status(500).send('Database not connected');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users(username, password, isAdmin) VALUES($1, $2, $3) RETURNING id';
        const values = [username, hashedPassword, isAdmin]; // Include isAdmin in values

        const result = await client.query(query, values);
        res.status(201).send(`User registered successfully! User ID: ${result.rows[0].id}`);
    } catch (dbError) {
        console.error('Error registering user', dbError);
        res.status(500).send('Error registering user');
    }
};

// User login endpoint
exports.login = async (req, res) => {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    try {
        // Check if the client is properly initialized
        if (!client._connected) {
            return res.status(500).send('Database not connected');
        }

        const query = 'SELECT * FROM users WHERE username = $1';
        const result = await client.query(query, [username]);

        if (result.rows.length === 0) {
            return res.status(401).send('Invalid username or password');
        }

        const user = result.rows[0];

        // Check if password matches
        if (await bcrypt.compare(password, user.password)) {
            console.log("JWT_SECRET:", process.env.JWT_SECRET); // Debugging log

            if (!process.env.JWT_SECRET) {
                console.error('JWT_SECRET is undefined');
                return res.status(500).send('Server error');
            }

            const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ token });
        } else {
            res.status(401).send('Invalid username or password');
        }
    } catch (dbError) {
        console.error('Error logging in', dbError);
        res.status(500).send('Error logging in');
    }
};
// User logout endpoint
exports.logout = (req, res) => {
    // For JWT, just inform the client to remove the token from storage
    res.status(200).send('Logged out successfully');
};
