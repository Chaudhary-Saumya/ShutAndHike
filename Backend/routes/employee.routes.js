const express = require('express');
const {
  CreateEmployee,
  GetEmployee,
  GetByIdEmployee,
  UpdateEmployee,
  DeleteEmployee
} = require('../controller/employee.controller');
const validate = require('../middleware/validate.middleware');
const { createEmployeeSchema, updateEmployeeSchema } = require('../validators/employee.validator');
const { mongoIdParamSchema } = require('../validators/common.validator');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { ROLES } = require('../config/roles');
const { apiLimiter } = require('../middleware/rateLimiter.middleware');

const router = express.Router();

// Apply authentication and rate limiter to all employee routes
router.use(authenticate);
router.use(apiLimiter);

// CREATE EMPLOYEE (Admin and Manager can create)
router.post('/', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(createEmployeeSchema), CreateEmployee);
router.post('/create-employee', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(createEmployeeSchema), CreateEmployee);

// GET ALL EMPLOYEES (Admin and Manager)
router.get('/', authorize(ROLES.ADMIN, ROLES.MANAGER), GetEmployee);
router.get('/get-employee', authorize(ROLES.ADMIN, ROLES.MANAGER), GetEmployee);

// GET EMPLOYEE BY ID (Admin, Manager, and Employee viewing self)
router.get('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE), validate(mongoIdParamSchema, 'params'), GetByIdEmployee);
router.get('/get-employee/:id', authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE), validate(mongoIdParamSchema, 'params'), GetByIdEmployee);

// UPDATE EMPLOYEE (Admin and Manager)
router.put('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(mongoIdParamSchema, 'params'), validate(updateEmployeeSchema), UpdateEmployee);
router.patch('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(mongoIdParamSchema, 'params'), validate(updateEmployeeSchema), UpdateEmployee);
router.put('/update-employee/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(mongoIdParamSchema, 'params'), validate(updateEmployeeSchema), UpdateEmployee);

// DELETE EMPLOYEE (Admin and Manager)
router.delete('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(mongoIdParamSchema, 'params'), DeleteEmployee);
router.delete('/delete-employee/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(mongoIdParamSchema, 'params'), DeleteEmployee);

module.exports = router;
