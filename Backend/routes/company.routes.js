const express = require('express');
const { CreateCompany, GetCompany, GetByIdCompany, GetCompanyByClientId, UpdateCompany, DeleteCompany } = require('../controller/company.controller');
const validate = require('../middleware/validate.middleware');
const { createCompanySchema, updateCompanySchema, clientIdParamSchema } = require('../validators/company.validator');
const { mongoIdParamSchema, updateStatusSchema } = require('../validators/common.validator');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { ROLES } = require('../config/roles');
const { apiLimiter } = require('../middleware/rateLimiter.middleware');

const router = express.Router();

router.use(authenticate);
router.use(apiLimiter);

router.post('/', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(createCompanySchema), CreateCompany);

router.get('/', authorize(ROLES.ADMIN, ROLES.MANAGER), GetCompany);

router.get('/client/:clientId', authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.CLIENT), validate(clientIdParamSchema, 'params'), GetCompanyByClientId);

router.get('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.CLIENT), validate(mongoIdParamSchema, 'params'), GetByIdCompany);

router.put('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(mongoIdParamSchema, 'params'), validate(updateCompanySchema), UpdateCompany);

router.delete('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(mongoIdParamSchema, 'params'), DeleteCompany);

module.exports = router;
