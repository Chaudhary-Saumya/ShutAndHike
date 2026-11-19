const mongoose = require('mongoose');
const User = require('../models/user.model');
const { ROLES } = require('../config/roles');

/**
 * Create Employee (Admin and Manager)
 */
const CreateEmployee = async (req, res, next) => {
  try {
    const { name, email, password, phone, designation, department, reportingTo } = req.body;

    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const creatorId = req.user?._id || req.data?._id;
    const creatorRole = req.user?.role || req.data?.role;

    // Default reportingTo to the creating manager if not explicitly specified
    let supervisorId = reportingTo || null;
    if (!supervisorId && creatorRole === ROLES.MANAGER) {
      supervisorId = creatorId;
    }

    const employee = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim(),
      role: ROLES.EMPLOYEE,
      phone: phone ? Number(phone) : null,
      designation: designation ? designation.trim() : 'Employee',
      department: department ? department.trim() : 'Operations',
      createdBy: creatorId,
      userId: creatorId,
      reportingTo: supervisorId
    });

    const populated = await User.findById(employee._id)
      .populate('createdBy', 'name email role')
      .populate('reportingTo', 'name email role');

    return res.status(201).json({
      success: true,
      message: 'Employee created successfully.',
      CreateEmployee: populated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get All Employees (Admin and Manager)
 * Only returns users with role 'Employee'.
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
        { designation: regex },
        { department: regex }
      ];
    }

    if (req.query.reportingTo && mongoose.Types.ObjectId.isValid(req.query.reportingTo)) {
      filter.reportingTo = req.query.reportingTo;
    }

    if (req.query.department) {
      filter.department = req.query.department.trim();
    }

    if (req.query.status) {
      filter.isActive = req.query.status === 'active';
    }

    const [employees, total] = await Promise.all([
      User.find(filter)
        .populate('createdBy', 'name email role')
        .populate('reportingTo', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      data: {
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      },
      // Backward-compatibility keys
      msg: 'read the employee',
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
      .populate('createdBy', 'name email role')
      .populate('reportingTo', 'name email role');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.'
      });
    }

    return res.status(200).json({
      success: true,
      msg: 'Employee fetched successfully',
      GetByIdEmployee: employee
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

    const { name, email, password, phone, designation, department, reportingTo, isActive } = req.body;

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
    if (designation !== undefined) employee.designation = designation ? designation.trim() : employee.designation;
    if (department !== undefined) employee.department = department ? department.trim() : employee.department;
    if (reportingTo !== undefined) {
      employee.reportingTo = reportingTo && mongoose.Types.ObjectId.isValid(reportingTo) ? reportingTo : null;
    }
    if (isActive !== undefined) employee.isActive = Boolean(isActive);

    // Safely update password with proper hashing
    if (password && password.trim().length > 0) {
      employee.password = password.trim();
    }

    await employee.save();

    const updated = await User.findById(id)
      .populate('createdBy', 'name email role')
      .populate('reportingTo', 'name email role');

    return res.status(200).json({
      success: true,
      message: 'Employee updated successfully.',
      UpdateEmployee: updated
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
  DeleteEmployee
};
