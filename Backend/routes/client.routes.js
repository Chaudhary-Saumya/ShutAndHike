const express = require('express');
const { CreateClient, GetClient, GetByIdClient, UpdateClient, DeleteClient } = require('../controller/client.controller');
const validate = require('../middleware/validate.middleware');
const { createClientSchema, updateClientSchema } = require('../validators/client.validator');
const { mongoIdParamSchema } = require('../validators/common.validator');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { ROLES } = require('../config/roles');
const { apiLimiter } = require('../middleware/rateLimiter.middleware');

const router = express.Router();

router.use(authenticate);
router.use(apiLimiter);

router.post('/', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(createClientSchema), CreateClient);
router.post('/create-client', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(createClientSchema), CreateClient);

router.get('/', authorize(ROLES.ADMIN, ROLES.MANAGER), GetClient);
router.get('/get-client', authorize(ROLES.ADMIN, ROLES.MANAGER), GetClient);

router.get('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.CLIENT), validate(mongoIdParamSchema, 'params'), GetByIdClient);
router.get('/get-client/:id', authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.CLIENT), validate(mongoIdParamSchema, 'params'), GetByIdClient);

router.put('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(mongoIdParamSchema, 'params'), validate(updateClientSchema), UpdateClient);
router.patch('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(mongoIdParamSchema, 'params'), validate(updateClientSchema), UpdateClient);
router.put('/update-client/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(mongoIdParamSchema, 'params'), validate(updateClientSchema), UpdateClient);

router.delete('/:id', authorize(ROLES.ADMIN), validate(mongoIdParamSchema, 'params'), DeleteClient);
router.delete('/delete-client/:id', authorize(ROLES.ADMIN), validate(mongoIdParamSchema, 'params'), DeleteClient);

module.exports = router;