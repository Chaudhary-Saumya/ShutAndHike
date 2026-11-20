const mongoose = require('mongoose');
const User = require('../models/user.model');
const { ROLES } = require('../config/roles');

/**
 * Helper to resolve access status from request body
 */
const resolveAccessStatus = (body) => {
  if (body.isActive !== undefined) return Boolean(body.isActive);
  if (body.status !== undefined) return body.status === 'active';
  if (body.accessStatus !== undefined) return body.accessStatus === 'active';
  return true;
};

/**
 * Create Employee (Admin and Manager)
 */
const CreateEmployee = async (req, res, next) => {
  try {
    const { name, email, password, phone, designation } = req.body;

    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const isActive = resolveAccessStatus(req.body);

    const employee = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim(),
      role: ROLES.EMPLOYEE,
      phone: phone ? String(phone).trim() : null,
      designation: designation ? designation.trim() : 'Employee',
      isActive,
      createdBy: req.user._id
    });

    const populated = await User.findById(employee._id).populate('createdBy', 'name email role');

    return res.status(201).json({
      success: true,
      message: 'Employee created successfully.',
      data: { employee: populated },
      CreateEmployee: populated,
      employee: populated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get All Employees (Admin and Manager)
 */
const GetEmployee = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = { role: ROLES.EMPLOYEE };

    if (req.query.search) {
      const regex = new RegExp(req.query.search.trim(), 'i');
      filter.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { designation: regex }
      ];
    }

    if (req.query.designation) {
      filter.designation = new RegExp(req.query.designation.trim(), 'i');
    }

    if (req.query.status || req.query.accessStatus) {
      const statusParam = req.query.status || req.query.accessStatus;
      filter.isActive = statusParam === 'active';
    }

    const [employees, total] = await Promise.all([
      User.find(filter)
        .populate('createdBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      data: {
        employees,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      },
      GetEmployee: employees
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Employee by ID (Admin, Manager, or Employee viewing self)
 */
const GetByIdEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Employee ID format.'
      });
    }

    // If caller is an Employee, they can only view their own profile
    if (req.user?.role === ROLES.EMPLOYEE && String(req.user._id) !== String(id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own profile.'
      });
    }

    const employee = await User.findOne({ _id: id, role: ROLES.EMPLOYEE })
      .populate('createdBy', 'name email role');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: { employee },
      GetByIdEmployee: employee,
      employee
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Employee (Admin and Manager)
 */
const UpdateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Employee ID format.'
      });
    }

    const employee = await User.findOne({ _id: id, role: ROLES.EMPLOYEE });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.'
      });
    }

    const { name, email, password, phone, designation } = req.body;

    if (email && email.trim().toLowerCase() !== employee.email) {
      const emailConflict = await User.findOne({
        email: email.trim().toLowerCase(),
        _id: { $ne: id }
      });
      if (emailConflict) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists.'
        });
      }
      employee.email = email.trim().toLowerCase();
    }

    if (name) employee.name = name.trim();
    if (phone !== undefined) employee.phone = phone ? String(phone).trim() : null;
    if (designation !== undefined) employee.designation = designation ? designation.trim() : null;

    if (req.body.isActive !== undefined || req.body.status !== undefined || req.body.accessStatus !== undefined) {
      employee.isActive = resolveAccessStatus(req.body);
    }

    if (password && password.trim().length > 0) {
      employee.password = password.trim();
    }

    await employee.save();

    const updated = await User.findById(id).populate('createdBy', 'name email role');

    return res.status(200).json({
      success: true,
      message: 'Employee updated successfully.',
      data: { employee: updated },
      UpdateEmployee: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Enable / Disable Employee Status (Admin and Manager)
 */
const UpdateEmployeeStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Employee ID format.'
      });
    }

    const employee = await User.findOne({ _id: id, role: ROLES.EMPLOYEE });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.'
      });
    }

    if (req.body.isActive !== undefined || req.body.status !== undefined || req.body.accessStatus !== undefined) {
      employee.isActive = resolveAccessStatus(req.body);
    } else {
      employee.isActive = !employee.isActive;
    }

    await employee.save();

    const updated = await User.findById(id).populate('createdBy', 'name email role');

    return res.status(200).json({
      success: true,
      message: `Employee account successfully ${employee.isActive ? 'enabled' : 'disabled'}.`,
      data: { employee: updated },
      employee: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Employee (Admin and Manager)
 */
const DeleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Employee ID format.'
      });
    }

    const employee = await User.findOne({ _id: id, role: ROLES.EMPLOYEE });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.'
      });
    }

    const deletedEmployee = await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Employee deleted successfully.',
      data: { employee: deletedEmployee },
      DeleteEmployee: deletedEmployee
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  CreateEmployee,
  GetEmployee,
  GetByIdEmployee,
  UpdateEmployee,
  UpdateEmployeeStatus,
  DeleteEmployee,
  // Modern naming aliases
  createEmployee: CreateEmployee,
  getAllEmployees: GetEmployee,
  getEmployeeById: GetByIdEmployee,
  updateEmployee: UpdateEmployee,
  updateEmployeeStatus: UpdateEmployeeStatus,
  deleteEmployee: DeleteEmployee
};
