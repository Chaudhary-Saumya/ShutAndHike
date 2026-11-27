const { z } = require('zod');
const { mongoIdRegex } = require('./common.validator');

const dateStringSchema = z
  .string()
  .refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format. Expected a valid date string (e.g. YYYY-MM-DD or ISO 8601)'
  });

const createClientServiceSchema = z.object({
  clientId: z
    .string({ required_error: 'Client ID is required' })
    .regex(mongoIdRegex, 'Invalid Client ID format'),
  proposalId: z
    .string({ required_error: 'Proposal ID is required' })
    .regex(mongoIdRegex, 'Invalid Proposal ID format'),
  serviceId: z
    .string({ required_error: 'Service ID is required' })
    .regex(mongoIdRegex, 'Invalid Service ID format'),
  startDate: dateStringSchema.optional(),
  endDate: dateStringSchema.optional().nullable(),
  status: z
    .enum(['active', 'paused', 'completed', 'cancelled'], {
      errorMap: () => ({ message: 'Status must be active, paused, completed, or cancelled' })
    })
    .optional()
    .default('active')
});

const updateClientServiceSchema = z.object({
  price: z
    .number()
    .min(0, 'Price cannot be negative')
    .optional(),
  duration: z
    .number()
    .min(1, 'Duration must be at least 1')
    .nullable()
    .optional(),
  durationUnit: z
    .enum(['month', 'year'])
    .optional(),
  billingType: z
    .enum(['monthly', 'one-time'])
    .optional(),
  startDate: dateStringSchema.optional(),
  endDate: dateStringSchema.optional().nullable(),
  status: z
    .enum(['active', 'paused', 'completed', 'cancelled'], {
      errorMap: () => ({ message: 'Status must be active, paused, completed, or cancelled' })
    })
    .optional()
});

const updateClientServiceStatusSchema = z.object({
  status: z.enum(['active', 'paused', 'completed', 'cancelled'], {
    required_error: 'Status is required',
    errorMap: () => ({ message: 'Status must be active, paused, completed, or cancelled' })
  })
});

const clientIdParamSchema = z.object({
  clientId: z.string().regex(mongoIdRegex, 'Invalid Client ID format')
});

const proposalIdParamSchema = z.object({
  proposalId: z.string().regex(mongoIdRegex, 'Invalid Proposal ID format')
});

const clientServiceQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  search: z.string().trim().optional(),
  status: z.enum(['active', 'paused', 'completed', 'cancelled']).optional(),
  clientId: z.string().regex(mongoIdRegex, 'Invalid Client ID format').optional(),
  proposalId: z.string().regex(mongoIdRegex, 'Invalid Proposal ID format').optional()
});

module.exports = {
  createClientServiceSchema,
  updateClientServiceSchema,
  updateClientServiceStatusSchema,
  clientIdParamSchema,
  proposalIdParamSchema,
  clientServiceQuerySchema
};
