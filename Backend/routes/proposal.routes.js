const express = require('express');
const {
  CreateProposal,
  GetProposals,
  GetByIdProposal,
  UpdateProposal,
  UpdateProposalStatus,
  DeleteProposal,
  GetProposalsByClientId,
  UpdateProposalStatusByClient
} = require('../controller/proposal.controller');
const validate = require('../middleware/validate.middleware');
const {
  createProposalSchema,
  updateProposalSchema,
  updateProposalStatusSchema,
  clientProposalStatusSchema,
  clientIdParamSchema
} = require('../validators/proposal.validator');
const { mongoIdParamSchema } = require('../validators/common.validator');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { ROLES } = require('../config/roles');
const { apiLimiter } = require('../middleware/rateLimiter.middleware');

const router = express.Router();

router.use(authenticate);
router.use(apiLimiter);

router.post('/', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(createProposalSchema), CreateProposal );

router.get('/', authorize(ROLES.ADMIN, ROLES.MANAGER), GetProposals );

router.get('/client/:clientId', authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.CLIENT), validate(clientIdParamSchema, 'params'), GetProposalsByClientId );

router.get('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.CLIENT), validate(mongoIdParamSchema, 'params'), GetByIdProposal );

router.patch('/:id/status', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(mongoIdParamSchema, 'params'), validate(updateProposalStatusSchema), UpdateProposalStatus);

router.patch('/:id/client-status', authorize(ROLES.CLIENT), validate(mongoIdParamSchema, 'params'), validate(clientProposalStatusSchema), UpdateProposalStatusByClient);

router.put('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(mongoIdParamSchema, 'params'), validate(updateProposalSchema), UpdateProposal);

router.delete('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(mongoIdParamSchema, 'params'), DeleteProposal);

module.exports = router;
