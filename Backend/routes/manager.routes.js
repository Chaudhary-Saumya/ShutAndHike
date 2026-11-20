const express = require('express');
const {
  CreateManager,
  ReadManager,
  GetByIdManager,
  UpdateManager,
  UpdateManagerStatus,
  DeleteManager
} = require('../controller/manager.controller');
const validate = require('../middleware/validate.middleware');
const { createManagerSchema, updateManagerSchema } = require('../validators/manager.validator');
const { mongoIdParamSchema, updateStatusSchema } = require('../validators/common.validator');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { ROLES } = require('../config/roles');
const { apiLimiter } = require('../middleware/rateLimiter.middleware');

const router = express.Router();

router.use(authenticate);
router.use(apiLimiter);

// CREATE MANAGER (Admin Only)
router.post('/', authorize(ROLES.ADMIN), validate(createManagerSchema), CreateManager);

// GET ALL MANAGERS (Admin & Manager)
router.get('/', authorize(ROLES.ADMIN, ROLES.MANAGER), ReadManager);

// GET MANAGER BY ID (Admin & Manager)
router.get('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(mongoIdParamSchema, 'params'), GetByIdManager);

// ENABLE / DISABLE MANAGER STATUS (Admin Only)
router.patch('/:id/status', authorize(ROLES.ADMIN), validate(mongoIdParamSchema, 'params'), validate(updateStatusSchema), UpdateManagerStatus);

// UPDATE MANAGER (Admin Only)
router.put('/:id', authorize(ROLES.ADMIN), validate(mongoIdParamSchema, 'params'), validate(updateManagerSchema), UpdateManager);

// DELETE MANAGER (Admin Only)
router.delete('/:id', authorize(ROLES.ADMIN), validate(mongoIdParamSchema, 'params'), DeleteManager);

module.exports = router;
