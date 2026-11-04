const express = require('express');
const { register, login, logout, getMe } = require('../controller/auth.controller');
const validate = require('../middleware/validate.middleware');
const { registerSchema, loginSchema } = require('../validators/auth.validator');
const { authLimiter } = require('../middleware/rateLimiter.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const { ROLE_PERMISSIONS } = require('../config/roles');

const router = express.Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.get('/roles', (req, res) => {
  res.status(200).json({
    success: true,
    data: ROLE_PERMISSIONS
  });
});

module.exports = router;
