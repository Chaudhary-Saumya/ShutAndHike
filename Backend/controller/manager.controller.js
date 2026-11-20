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
 * Create Manager (Admin Only)
 */
const CreateManager = async (req, res, next) => {
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

    const manager = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim(),
      role: ROLES.MANAGER,
      phone: phone ? String(phone).trim() : null,
      designation: designation ? designation.trim() : 'Manager',
      isActive,
      createdBy: req.user._id
    });

    const populated = await User.findById(manager._id).populate('createdBy', 'name email role');

    return res.status(201).json({
      success: true,
      message: 'Manager created successfully.',
      data: { manager: populated },
      CreateManager: populated,
      manager: populated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get All Managers (Admin and Manager)
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
      data: {
        managers,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      },
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
      success: true,
      data: { manager },
      manager
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

    const { name, email, password, phone, designation } = req.body;

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
    if (designation !== undefined) manager.designation = designation ? designation.trim() : null;

    if (req.body.isActive !== undefined || req.body.status !== undefined || req.body.accessStatus !== undefined) {
      manager.isActive = resolveAccessStatus(req.body);
    }

    if (password && password.trim().length > 0) {
      manager.password = password.trim();
    }

    await manager.save();

    const updated = await User.findById(id).populate('createdBy', 'name email role');

    return res.status(200).json({
      success: true,
      message: 'Manager updated successfully.',
      data: { manager: updated },
      UpdateManager: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Enable / Disable Manager Status (Admin Only)
 */
const UpdateManagerStatus = async (req, res, next) => {
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

    if (req.body.isActive !== undefined || req.body.status !== undefined || req.body.accessStatus !== undefined) {
      manager.isActive = resolveAccessStatus(req.body);
    } else {
      manager.isActive = !manager.isActive;
    }

    await manager.save();

    const updated = await User.findById(id).populate('createdBy', 'name email role');

    return res.status(200).json({
      success: true,
      message: `Manager account successfully ${manager.isActive ? 'enabled' : 'disabled'}.`,
      data: { manager: updated },
      manager: updated
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
      data: { manager: deletedManager },
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
  UpdateManagerStatus,
  DeleteManager,
  // Modern naming aliases
  createManager: CreateManager,
  getAllManagers: ReadManager,
  getManagerById: GetByIdManager,
  updateManager: UpdateManager,
  updateManagerStatus: UpdateManagerStatus,
  deleteManager: DeleteManager
};
