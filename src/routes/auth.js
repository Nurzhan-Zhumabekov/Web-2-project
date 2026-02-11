const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authController = require('../controllers/authController');

// Register
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

// Get profile
router.get('/profile', auth, authController.getProfile);

// Update profile
router.put('/profile', auth, authController.updateProfile);

// Logout
router.post('/logout', authController.logout);

module.exports = router;
