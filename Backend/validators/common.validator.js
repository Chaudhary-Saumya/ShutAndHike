const { z } = require('zod');

const mongoIdRegex = /^[0-9a-fA-F]{24}$/;

const mongoIdParamSchema = z.object({
  id: z.string().regex(mongoIdRegex, 'Invalid MongoDB ObjectId format')
});

const phoneSchema = z
  .union([
    z
      .number()
      .int()
      .min(1000000000, 'Phone number must be at least 10 digits')
      .max(9999999999, 'Phone number cannot exceed 10 digits'),
    z
      .string()
      .trim()
      .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits')
      .transform((val) => Number(val)),
    z.literal('').transform(() => null)
  ])
  .optional()
  .nullable()
  .transform((val) => (val === null || val === undefined ? null : Number(val)));

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  sort: z.string().trim().optional()
});

module.exports = {
  mongoIdRegex,
  mongoIdParamSchema,
  phoneSchema,
  paginationQuerySchema
};
