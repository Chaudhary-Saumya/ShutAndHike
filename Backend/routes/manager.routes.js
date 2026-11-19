const express = require('express');
const {
  CreateManager,
  ReadManager,
  GetByIdManager,
  UpdateManager,
  DeleteManager
} = require('../controller/manager.controller');
const validate = require('../middleware/validate.middleware');
const { createManagerSchema, updateManagerSchema } = require('../validators/manager.validator');
const { mongoIdParamSchema } = require('../validators/common.validator');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { ROLES } = require('../config/roles');
const { apiLimiter } = require('../middleware/rateLimiter.middleware');

const router = express.Router();

// Apply authentication and rate limiter to all manager routes
router.use(authenticate);
router.use(apiLimiter);

// CREATE MANAGER (Admin Only)
router.post('/', authorize(ROLES.ADMIN), validate(createManagerSchema), CreateManager);
router.post('/create-manager', authorize(ROLES.ADMIN), validate(createManagerSchema), CreateManager);

// GET ALL MANAGERS (Admin & Manager)
router.get('/', authorize(ROLES.ADMIN, ROLES.MANAGER), ReadManager);
router.get('/get-manager', authorize(ROLES.ADMIN, ROLES.MANAGER), ReadManager);

// GET MANAGER BY ID (Admin & Manager)
router.get('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(mongoIdParamSchema, 'params'), GetByIdManager);
router.get('/get-manager/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(mongoIdParamSchema, 'params'), GetByIdManager);

// UPDATE MANAGER (Admin Only)
router.put('/:id', authorize(ROLES.ADMIN), validate(mongoIdParamSchema, 'params'), validate(updateManagerSchema), UpdateManager);
router.patch('/:id', authorize(ROLES.ADMIN), validate(mongoIdParamSchema, 'params'), validate(updateManagerSchema), UpdateManager);
router.put('/update-manager/:id', authorize(ROLES.ADMIN), validate(mongoIdParamSchema, 'params'), validate(updateManagerSchema), UpdateManager);

// DELETE MANAGER (Admin Only)
router.delete('/:id', authorize(ROLES.ADMIN), validate(mongoIdParamSchema, 'params'), DeleteManager);
router.delete('/delete-manager/:id', authorize(ROLES.ADMIN), validate(mongoIdParamSchema, 'params'), DeleteManager);

module.exports = router;
