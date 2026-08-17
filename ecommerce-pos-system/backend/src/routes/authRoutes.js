const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const { loginLimiter } = require('../middlewares/rateLimiter');

// POST /api/auth/login - Admin login
router.post('/login', loginLimiter, authController.login);

// POST /api/auth/register - Register new admin (Superadmin only)
router.post('/register', authMiddleware, authController.register);

// GET /api/auth/profile - Get current user profile
router.get('/profile', authMiddleware, authController.getProfile);

// PUT /api/auth/profile - Update current user profile
router.put('/profile', authMiddleware, authController.updateProfile);

// PUT /api/auth/change-password - Change password
router.put('/change-password', authMiddleware, authController.changePassword);

// POST /api/auth/refresh-token - Refresh JWT token
router.post('/refresh-token', authMiddleware, authController.refreshToken);

module.exports = router;
