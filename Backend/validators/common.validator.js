const { z } = require('zod');

const mongoIdRegex = /^[0-9a-fA-F]{24}$/;

const mongoIdParamSchema = z.object({
  id: z.string().regex(mongoIdRegex, 'Invalid MongoDB ObjectId format')
});

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  sort: z.string().trim().optional()
});

module.exports = {
  mongoIdParamSchema,
  paginationQuerySchema
};
