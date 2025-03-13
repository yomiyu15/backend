const express = require('express');
const AuthController = require('../controller/authcontroller');

const router = express.Router();

// Register user route
router.post('/register', AuthController.register);

// Login user route
router.post('/login', AuthController.login);

module.exports = router;
