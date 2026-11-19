const express = require('express');
const { register, login, logout, getMe, changePassword } = require('../controller/auth.controller');
const validate = require('../middleware/validate.middleware');
const { registerAdminSchema, loginSchema, changePasswordSchema } = require('../validators/auth.validator');
const { authLimiter } = require('../middleware/rateLimiter.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const { ROLE_PERMISSIONS } = require('../config/roles');

const router = express.Router();

// Public: Only Admin can register directly via public registration
router.post('/register', authLimiter, validate(registerAdminSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', logout);

// Protected: Authenticated user profile and password change
router.get('/me', authenticate, getMe);
router.patch('/change-password', authenticate, validate(changePasswordSchema), changePassword);

// Roles discovery
router.get('/roles', (req, res) => {
  res.status(200).json({
    success: true,
    data: ROLE_PERMISSIONS
  });
});

module.exports = router;
