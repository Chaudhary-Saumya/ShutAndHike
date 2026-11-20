const express = require('express');
const {
  CreateClient,
  GetClient,
  GetByIdClient,
  UpdateClient,
  UpdateClientStatus,
  DeleteClient
} = require('../controller/client.controller');
const validate = require('../middleware/validate.middleware');
const { createClientSchema, updateClientSchema } = require('../validators/client.validator');
const { mongoIdParamSchema, updateStatusSchema } = require('../validators/common.validator');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { ROLES } = require('../config/roles');
const { apiLimiter } = require('../middleware/rateLimiter.middleware');

const router = express.Router();

router.use(authenticate);
router.use(apiLimiter);

// CREATE CLIENT (Admin and Manager)
router.post('/', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(createClientSchema), CreateClient);

// GET ALL CLIENTS (Admin and Manager)
router.get('/', authorize(ROLES.ADMIN, ROLES.MANAGER), GetClient);

// GET CLIENT BY ID (Admin, Manager, and Client viewing self)
router.get('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.CLIENT), validate(mongoIdParamSchema, 'params'), GetByIdClient);

// ENABLE / DISABLE CLIENT STATUS (Admin and Manager)
router.patch('/:id/status', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(mongoIdParamSchema, 'params'), validate(updateStatusSchema), UpdateClientStatus);

// UPDATE CLIENT (Admin and Manager)
router.put('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(mongoIdParamSchema, 'params'), validate(updateClientSchema), UpdateClient);

// DELETE CLIENT (Admin and Manager)
router.delete('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(mongoIdParamSchema, 'params'), DeleteClient);

module.exports = router;
