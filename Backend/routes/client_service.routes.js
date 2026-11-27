const express = require('express');
const validate = require('../middleware/validate.middleware');
const { mongoIdParamSchema } = require('../validators/common.validator');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { ROLES } = require('../config/roles');
const { apiLimiter } = require('../middleware/rateLimiter.middleware');
const {
  createClientServiceSchema,
  updateClientServiceSchema,
  updateClientServiceStatusSchema,
  clientIdParamSchema
} = require('../validators/client_service.validator');
const {
  CreateClientService,
  ReadClientService,
  GetByIdClientService,
  GetClientServicesByClientId,
  UpdateClientServiceStatus,
  UpdateClientService,
  DeleteClientService
} = require('../controller/client_sevice.controller');

const router = express.Router();

router.use(authenticate);
router.use(apiLimiter);

router.post('/', authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.CLIENT), validate(createClientServiceSchema), CreateClientService);

router.get('/', authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.CLIENT), ReadClientService);


router.get('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.CLIENT), validate(mongoIdParamSchema, 'params'), GetByIdClientService);

router.patch('/:id/status', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(mongoIdParamSchema, 'params'), validate(updateClientServiceStatusSchema), UpdateClientServiceStatus);

router.put('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(mongoIdParamSchema, 'params'), validate(updateClientServiceSchema), UpdateClientService);

router.delete('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(mongoIdParamSchema, 'params'),DeleteClientService);

module.exports = router;
