const { z } = require('zod');
const { mongoIdRegex } = require('./common.validator');

const serviceItemSchema = z.object({
  serviceId: z
    .string({ required_error: 'Service ID is required' })
    .regex(mongoIdRegex, 'Invalid Service ID format'),
  price: z
    .number({ required_error: 'Price is required' })
    .min(0, 'Price cannot be negative'),
  duration: z
    .number()
    .min(1, 'Duration must be at least 1')
    .nullable()
    .optional(),
  durationUnit: z
    .enum(['month', 'year'])
    .optional()
    .default('month'),
  billingType: z.enum(['monthly', 'one-time'], {
    required_error: 'Billing type is required'
  })
});

const createProposalSchema = z.object({
  clientId: z
    .string({ required_error: 'Client ID is required' })
    .regex(mongoIdRegex, 'Invalid Client ID format'),
  services: z
    .array(serviceItemSchema)
    .min(1, 'At least one service is required'),
  totalAmount: z
    .number()
    .min(0, 'Total amount cannot be negative')
    .optional(),
  notes: z
    .string()
    .trim()
    .optional(),
  status: z
    .enum(['draft', 'accepted', 'rejected', 'revision_requested'])
    .optional()
    .default('draft')
});

const updateProposalSchema = z.object({
  clientId: z
    .string()
    .regex(mongoIdRegex, 'Invalid Client ID format')
    .optional(),
  services: z
    .array(serviceItemSchema)
    .min(1, 'At least one service is required')
    .optional(),
  totalAmount: z
    .number()
    .min(0, 'Total amount cannot be negative')
    .optional(),
  notes: z
    .string()
    .trim()
    .optional(),
  status: z
    .enum(['draft', 'accepted', 'rejected', 'revision_requested'])
    .optional()
});

const updateProposalStatusSchema = z.object({
  status: z.enum(['draft', 'accepted', 'rejected', 'revision_requested'], {
    required_error: 'Status is required'
  }),
  notes: z.string().trim().optional()
});

const clientProposalStatusSchema = z.object({
  status: z.enum(['accepted', 'rejected', 'revision_requested'], {
    required_error: 'Status must be accepted, rejected, or revision_requested'
  }),
  notes: z.string().trim().optional()
});

const clientIdParamSchema = z.object({
  clientId: z.string().regex(mongoIdRegex, 'Invalid Client ID format')
});

module.exports = {
  serviceItemSchema,
  createProposalSchema,
  updateProposalSchema,
  updateProposalStatusSchema,
  clientProposalStatusSchema,
  clientIdParamSchema
};
