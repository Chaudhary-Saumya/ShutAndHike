const { z } = require('zod');
const { phoneSchema, mongoIdRegex } = require('./common.validator');

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
  companyName: z.string().trim().max(150, 'Company name cannot exceed 150 characters').optional().nullable(),
  industry: z.string().trim().max(100, 'Industry cannot exceed 100 characters').optional().nullable(),
  billingAddress: z.string().trim().max(300, 'Billing address cannot exceed 300 characters').optional().nullable(),
  reportingTo: z
    .string()
    .regex(mongoIdRegex, 'reportingTo must be a valid MongoDB ObjectId')
    .optional()
    .nullable()
});

const updateClientSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100).optional(),
  email: z.string().trim().toLowerCase().email('Please provide a valid email address').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters long').max(128).optional(),
  phone: phoneSchema,
  companyName: z.string().trim().max(150).optional().nullable(),
  industry: z.string().trim().max(100).optional().nullable(),
  billingAddress: z.string().trim().max(300).optional().nullable(),
  reportingTo: z
    .string()
    .regex(mongoIdRegex, 'reportingTo must be a valid MongoDB ObjectId')
    .optional()
    .nullable(),
  isActive: z.boolean().optional()
});

module.exports = {
  createClientSchema,
  updateClientSchema
};