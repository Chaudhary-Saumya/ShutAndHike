const mongoose = require('mongoose');
const User = require('../models/user.model');
const { ROLES } = require('../config/roles');

/**
 * Create Manager (Admin Only)
 */
const CreateManager = async (req, res, next) => {
  try {
    const { name, email, password, phone, designation, department } = req.body;

    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const adminId = req.user?._id || req.data?._id;

    const manager = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim(),
      role: ROLES.MANAGER,
      phone: phone ? Number(phone) : null,
      designation: designation ? designation.trim() : 'Manager',
      department: department ? department.trim() : 'Operations',
      createdBy: adminId,
      userId: adminId
    });

    const populated = await User.findById(manager._id).populate('createdBy', 'name email role');

    return res.status(201).json({
      msg: 'manager created successfully',
      CreateManager: populated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get All Managers (Admin and Manager)
 * Only returns users with role 'Manager'.
 */
const ReadManager = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = { role: ROLES.MANAGER };

    if (req.query.search) {
      const regex = new RegExp(req.query.search.trim(), 'i');
      filter.$or = [
        { name: regex },
        { email: regex },
        { designation: regex },
        { department: regex }
      ];
    }

    if (req.query.status) {
      filter.isActive = req.query.status === 'active';
    }

    const [managers, total] = await Promise.all([
      User.find(filter)
        .populate('createdBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      message: 'Managers retrieved successfully.',
      data: {
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      },
      // Backward-compatibility keys
      msg: 'read the manager',
      ReadManager: managers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Single Manager by ID (Admin and Manager)
 */
const GetByIdManager = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Manager ID format.'
      });
    }

    const manager = await User.findOne({ _id: id, role: ROLES.MANAGER })
      .populate('createdBy', 'name email role');

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: 'Manager not found.'
      });
    }

    return res.status(200).json({
      success: true,manager
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Manager (Admin Only)
 */
const UpdateManager = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Manager ID format.'
      });
    }

    const manager = await User.findOne({ _id: id, role: ROLES.MANAGER });
    if (!manager) {
      return res.status(404).json({
        success: false,
        message: 'Manager not found.'
      });
    }

    const { name, email, password, phone, designation, department, isActive } = req.body;

    if (email && email.trim().toLowerCase() !== manager.email) {
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
      manager.email = email.trim().toLowerCase();
    }

    if (name) manager.name = name.trim();
    if (phone !== undefined) manager.phone = phone ? String(phone).trim() : null;
    if (designation !== undefined) manager.designation = designation ? designation.trim() : manager.designation;
    if (department !== undefined) manager.department = department ? department.trim() : manager.department;
    if (isActive !== undefined) manager.isActive = Boolean(isActive);

    // Securely update password if provided
    if (password && password.trim().length > 0) {
      manager.password = password.trim();
    }

    await manager.save();

    const updated = await User.findById(id).populate('createdBy', 'name email role');

    return res.status(200).json({
      success: true, msg: 'Manager update successfully',
      UpdateManager: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Manager (Admin Only)
 */
const DeleteManager = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Manager ID format.'
      });
    }

    const manager = await User.findOne({ _id: id, role: ROLES.MANAGER });
    if (!manager) {
      return res.status(404).json({
        success: false,
        message: 'Manager not found.'
      });
    }

    const deletedManager = await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Manager deleted successfully.',
      DeleteManager: deletedManager
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  CreateManager,
  ReadManager,
  GetByIdManager,
  UpdateManager,
  DeleteManager
};
