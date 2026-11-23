const express = require('express');
const { CreateMasterService, GetMasterService, GetByIdMasterService, UpdateMasterService, UpdateMasterServiceStatus, DeleteMasterService} = require('../controller/master_service.controller');
const validate = require('../middleware/validate.middleware');
const { createMasterServiceSchema, updateMasterServiceSchema } = require('../validators/master_service.validator');
const { mongoIdParamSchema, updateStatusSchema } = require('../validators/common.validator');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { ROLES } = require('../config/roles');
const { apiLimiter } = require('../middleware/rateLimiter.middleware');

const router = express.Router();

router.use(authenticate);
router.use(apiLimiter);

router.post('/', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(createMasterServiceSchema), CreateMasterService);

router.get('/', authorize(ROLES.ADMIN, ROLES.MANAGER), GetMasterService);

router.get('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(mongoIdParamSchema, 'params'), GetByIdMasterService);

router.put('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(mongoIdParamSchema, 'params'), validate(updateMasterServiceSchema), UpdateMasterService);

router.delete('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(mongoIdParamSchema, 'params'), DeleteMasterService);

module.exports = router;
