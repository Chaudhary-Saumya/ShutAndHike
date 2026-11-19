const express = require('express');
const {
  CreateEmployee,
  GetEmployee,
  GetByIdEmployee,
  UpdateEmployee,
  DeleteEmployee
} = require('../controller/employee.controller');
const { apiLimiter } = require('../middleware/rateLimiter.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const admin = require('../middleware/admin.middleware');

const router = express.Router();

router.post('/create-employee', authenticate, admin, apiLimiter, CreateEmployee);
router.get('/get-employee', apiLimiter, GetEmployee);
router.get('/get-employee/:id', apiLimiter, GetByIdEmployee);
router.put('/update-employee/:id', authenticate, apiLimiter, UpdateEmployee);
router.delete('/delete-employee/:id', authenticate, apiLimiter, DeleteEmployee);

module.exports = router;
