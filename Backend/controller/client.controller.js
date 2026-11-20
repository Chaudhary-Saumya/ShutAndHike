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
 * Create Client (Admin and Manager)
 */
const CreateClient = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const isActive = resolveAccessStatus(req.body);

    const client = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim(),
      role: ROLES.CLIENT,
      phone: phone ? String(phone).trim() : null,
      isActive,
      createdBy: req.user._id
    });

    const populated = await User.findById(client._id).populate('createdBy', 'name email role');

    return res.status(201).json({
      success: true,
      message: 'Client created successfully.',
      data: { client: populated },
      CreateClient: populated,
      client: populated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get All Clients (Admin and Manager)
 */
const GetClient = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = { role: ROLES.CLIENT };

    if (req.query.search) {
      const regex = new RegExp(req.query.search.trim(), 'i');
      filter.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    if (req.query.status || req.query.accessStatus) {
      const statusParam = req.query.status || req.query.accessStatus;
      filter.isActive = statusParam === 'active';
    }

    const [clients, total] = await Promise.all([
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
        clients,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      },
      GetClient: clients
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Client by ID (Admin, Manager, or Client viewing self)
 */
const GetByIdClient = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Client ID format.'
      });
    }

    // If caller is a Client, they can only view their own profile
    if (req.user?.role === ROLES.CLIENT && String(req.user._id) !== String(id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own profile.'
      });
    }

    const client = await User.findOne({ _id: id, role: ROLES.CLIENT })
      .populate('createdBy', 'name email role');

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: { client },
      GetByIdClient: client,
      client
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Client (Admin and Manager)
 */
const UpdateClient = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Client ID format.'
      });
    }

    const client = await User.findOne({ _id: id, role: ROLES.CLIENT });
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found.'
      });
    }

    const { name, email, password, phone } = req.body;

    if (email && email.trim().toLowerCase() !== client.email) {
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
      client.email = email.trim().toLowerCase();
    }

    if (name) client.name = name.trim();
    if (phone !== undefined) client.phone = phone ? String(phone).trim() : null;

    if (req.body.isActive !== undefined || req.body.status !== undefined || req.body.accessStatus !== undefined) {
      client.isActive = resolveAccessStatus(req.body);
    }

    if (password && password.trim().length > 0) {
      client.password = password.trim();
    }

    await client.save();

    const updated = await User.findById(id).populate('createdBy', 'name email role');

    return res.status(200).json({
      success: true,
      message: 'Client updated successfully.',
      data: { client: updated },
      UpdateClient: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Enable / Disable Client Status (Admin and Manager)
 */
const UpdateClientStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Client ID format.'
      });
    }

    const client = await User.findOne({ _id: id, role: ROLES.CLIENT });
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found.'
      });
    }

    if (req.body.isActive !== undefined || req.body.status !== undefined || req.body.accessStatus !== undefined) {
      client.isActive = resolveAccessStatus(req.body);
    } else {
      client.isActive = !client.isActive;
    }

    await client.save();

    const updated = await User.findById(id).populate('createdBy', 'name email role');

    return res.status(200).json({
      success: true,
      message: `Client account successfully ${client.isActive ? 'enabled' : 'disabled'}.`,
      data: { client: updated },
      client: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Client (Admin and Manager)
 */
const DeleteClient = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Client ID format.'
      });
    }

    const client = await User.findOne({ _id: id, role: ROLES.CLIENT });
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found.'
      });
    }

    const deletedClient = await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Client deleted successfully.',
      data: { client: deletedClient },
      DeleteClient: deletedClient
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  CreateClient,
  GetClient,
  GetByIdClient,
  UpdateClient,
  UpdateClientStatus,
  DeleteClient,
  // Modern naming aliases
  createClient: CreateClient,
  getAllClients: GetClient,
  getClientById: GetByIdClient,
  updateClient: UpdateClient,
  updateClientStatus: UpdateClientStatus,
  deleteClient: DeleteClient
};
