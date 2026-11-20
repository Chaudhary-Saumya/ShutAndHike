const { z } = require('zod');

const mongoIdRegex = /^[0-9a-fA-F]{24}$/;

const mongoIdParamSchema = z.object({
  id: z.string().regex(mongoIdRegex, 'Invalid MongoDB ObjectId format')
});

// Clean, optional phone field (string, number, or null/empty)
const phoneSchema = z
  .union([
    z.string().trim(),
    z.number().transform((n) => String(n)),
    z.null(),
    z.undefined()
  ])
  .optional()
  .transform((val) => (val && String(val).trim() ? String(val).trim() : null));

const updateStatusSchema = z.object({
  isActive: z.boolean().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  accessStatus: z.enum(['active', 'inactive']).optional()
});

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
  updateStatusSchema,
  paginationQuerySchema
};
