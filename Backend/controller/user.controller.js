const mongoose = require('mongoose');
const User = require('../models/user.model');
const { ROLES } = require('../config/roles');

const resolveAccessStatus = (body) => {
  if (body.isActive !== undefined) return Boolean(body.isActive);
  if (body.status !== undefined) return body.status === 'active';
  if (body.accessStatus !== undefined) return body.accessStatus === 'active';
  return null;
};

/**
 * Enable or Disable any account accurately (Admin Only)
 * Can enable/disable Manager, Employee, or Client.
 */
const UpdateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid User ID format.'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    // Safety: Admin cannot disable their own active admin session
    if (String(user._id) === String(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot disable your own admin account.'
      });
    }

    const resolvedStatus = resolveAccessStatus(req.body);
    if (resolvedStatus !== null) {
      user.isActive = resolvedStatus;
    } else {
      user.isActive = !user.isActive;
    }

    await user.save();

    const populated = await User.findById(id).populate('createdBy', 'name email role');

    return res.status(200).json({
      success: true,
      message: `${user.role} account (${user.name}) successfully ${user.isActive ? 'enabled' : 'disabled'}.`,
      data: { user: populated },
      user: populated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users across all roles (Admin Only)
 */
const GetAllUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.role) {
      filter.role = req.query.role;
    }

    if (req.query.search) {
      const regex = new RegExp(req.query.search.trim(), 'i');
      filter.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { designation: regex }
      ];
    }

    if (req.query.status || req.query.accessStatus) {
      const statusParam = req.query.status || req.query.accessStatus;
      filter.isActive = statusParam === 'active';
    }

    const [users, total] = await Promise.all([
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
        users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get any user by ID (Admin Only)
 */
const GetUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid User ID format.'
      });
    }

    const user = await User.findById(id).populate('createdBy', 'name email role');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: { user },
      user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  UpdateUserStatus,
  GetAllUsers,
  GetUserById
};
