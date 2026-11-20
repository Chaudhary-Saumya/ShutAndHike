const { z } = require('zod');
const { phoneSchema } = require('./common.validator');

const createClientSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters long')
    .max(128, 'Password cannot exceed 128 characters'),
  phone: phoneSchema,
  isActive: z.boolean().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  accessStatus: z.enum(['active', 'inactive']).optional()
});

const updateClientSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  email: z.string().trim().toLowerCase().email().optional(),
  password: z.string().min(6).max(128).optional(),
  phone: phoneSchema,
  isActive: z.boolean().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  accessStatus: z.enum(['active', 'inactive']).optional()
});

module.exports = {
  createClientSchema,
  updateClientSchema
};
