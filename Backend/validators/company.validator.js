const { z } = require('zod');
const { phoneSchema, mongoIdRegex } = require('./common.validator');

const createCompanySchema = z.object({
  companyName: z
    .string({ required_error: 'Company name is required' })
    .trim()
    .min(2, 'Company name must be at least 2 characters')
    .max(200, 'Company name cannot exceed 200 characters'),
  companyEmail: z
    .string({ required_error: 'Company email is required' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid company email address'),
  companyPhone: z
    .string({ required_error: 'Company phone is required' })
    .trim()
    .min(1, 'Company phone is required'),
  companyAddress: z
    .string({ required_error: 'Company address is required' })
    .trim()
    .min(1, 'Company address is required')
    .max(500, 'Company address cannot exceed 500 characters'),
  companyDescription: z
    .string()
    .trim()
    .max(2000, 'Company description cannot exceed 2000 characters')
    .optional()
    .nullable()
    .default(null),
  clientId: z
    .string({ required_error: 'Client ID is required' })
    .regex(mongoIdRegex, 'Invalid Client ID format'),
  // Access status can be provided as boolean or 'active' / 'inactive' string
  isActive: z.boolean().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  accessStatus: z.enum(['active', 'inactive']).optional()
});

const updateCompanySchema = z.object({
  companyName: z.string().trim().min(2).max(200).optional(),
  companyEmail: z.string().trim().toLowerCase().email().optional(),
  companyPhone: z.string().trim().optional(),
  companyAddress: z.string().trim().max(500).optional(),
  companyDescription: z.string().trim().max(2000).optional().nullable(),
  clientId: z.string().regex(mongoIdRegex, 'Invalid Client ID format').optional(),
  isActive: z.boolean().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  accessStatus: z.enum(['active', 'inactive']).optional()
});

const clientIdParamSchema = z.object({
  clientId: z.string().regex(mongoIdRegex, 'Invalid Client ID format')
});

module.exports = {
  createCompanySchema,
  updateCompanySchema,
  clientIdParamSchema
};
