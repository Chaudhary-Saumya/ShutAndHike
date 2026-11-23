const { z } = require('zod');

const createMasterServiceSchema = z.object({
  name: z
    .string({ required_error: 'Service name is required' })
    .trim()
    .min(1, 'Service name cannot be empty'),
  slug: z
    .string({ required_error: 'Slug is required' })
    .trim()
    .toLowerCase()
    .min(1, 'Slug cannot be empty'),
  category: z
    .string({ required_error: 'Category is required' })
    .trim()
    .min(1, 'Category cannot be empty'),
  description: z
    .string({ required_error: 'Description is required' })
    .trim()
    .min(1, 'Description cannot be empty'),
  status: z
    .enum(['active', 'inactive'], {
      errorMap: () => ({ message: 'Status must be either active or inactive' })
    })
    .optional()
    .default('active')
});

const updateMasterServiceSchema = z.object({
  name: z.string().trim().min(1).optional(),
  slug: z.string().trim().toLowerCase().min(1).optional(),
  category: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  status: z.enum(['active', 'inactive']).optional()
});

module.exports = {
  createMasterServiceSchema,
  updateMasterServiceSchema
};