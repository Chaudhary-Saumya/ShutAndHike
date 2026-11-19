const { z } = require('zod');
const { phoneSchema, mongoIdRegex } = require('./common.validator');

const createEmployeeSchema = z.object({
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
  designation: z.string().trim().max(100).optional().default('Employee'),
  department: z.string().trim().max(100).optional().default('Delivery'),
  reportingTo: z
    .string()
    .regex(mongoIdRegex, 'reportingTo must be a valid MongoDB ObjectId')
    .optional()
    .nullable()
});

const updateEmployeeSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  email: z.string().trim().toLowerCase().email().optional(),
  password: z.string().min(6).max(128).optional(),
  phone: phoneSchema,
  designation: z.string().trim().max(100).optional(),
  department: z.string().trim().max(100).optional(),
  reportingTo: z
    .string()
    .regex(mongoIdRegex, 'reportingTo must be a valid MongoDB ObjectId')
    .optional()
    .nullable(),
  isActive: z.boolean().optional()
});

module.exports = {
  createEmployeeSchema,
  updateEmployeeSchema
};
