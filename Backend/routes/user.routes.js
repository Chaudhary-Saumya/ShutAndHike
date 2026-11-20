const express = require('express');
const {
  UpdateUserStatus,
  GetAllUsers,
  GetUserById
} = require('../controller/user.controller');
const validate = require('../middleware/validate.middleware');
const { mongoIdParamSchema, updateStatusSchema } = require('../validators/common.validator');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { ROLES } = require('../config/roles');
const { apiLimiter } = require('../middleware/rateLimiter.middleware');

const router = express.Router();

// Apply authentication and admin-only authorization to all user management routes
router.use(authenticate);
router.use(authorize(ROLES.ADMIN));
router.use(apiLimiter);

// Get all users across all roles (with search & filters)
router.get('/', GetAllUsers);

// Get any user by ID
router.get('/:id', validate(mongoIdParamSchema, 'params'), GetUserById);

// Enable or disable any user account (Manager, Employee, Client)
router.patch('/:id/status', validate(mongoIdParamSchema, 'params'), validate(updateStatusSchema), UpdateUserStatus);

module.exports = router;
