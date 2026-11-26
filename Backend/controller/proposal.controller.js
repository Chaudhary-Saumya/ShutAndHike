const mongoose = require('mongoose');
const Proposal = require('../models/proposal.model');
const User = require('../models/user.model');
const MasterService = require('../models/master_service.model');
const { ROLES } = require('../config/roles');

const calculateTotal = (services) => {
  return services.reduce((total, service) => {
    const amount =
      service.billingType === 'monthly'
        ? service.price * (service.duration || 1)
        : service.price;

    return total + amount;
  }, 0);
};

const CreateProposal = async (req, res, next) => {
  try {
    const { clientId, services, notes, status, totalAmount } = req.body;

    const client = await User.findOne({ _id: clientId, role: ROLES.CLIENT });
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found. Please provide a valid Client ID.'
      });
    }

    if (!Array.isArray(services) || services.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one service is required.'
      });
    }

    const serviceIds = services.map((s) => s.serviceId);
    const existingServices = await MasterService.find({ _id: { $in: serviceIds } });
    if (existingServices.length !== serviceIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more selected services are invalid or do not exist.'
      });
    }

    const calculated = calculateTotal(services);
    const finalTotal = totalAmount !== undefined && totalAmount !== null ? Number(totalAmount) : calculated;

    const proposal = await Proposal.create({
      clientId,
      services,
      totalAmount: finalTotal,
      notes: notes ? notes.trim() : '',
      status: status || 'draft',
      createdBy: req.user._id
    });

    const populated = await Proposal.findById(proposal._id)
      .populate('clientId', 'name email phone role')
      .populate('services.serviceId', 'name slug category description status')
      .populate('createdBy', 'name email role')
      .populate('updatedBy', 'name email role');

    return res.status(201).json({
      success: true,
      message: 'Proposal created successfully.',
      CreateProposal: populated,
    });
  } catch (error) {
    next(error);
  }
};

const GetProposals = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.clientId) {
      if (!mongoose.Types.ObjectId.isValid(req.query.clientId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Client ID format.'
        });
      }
      filter.clientId = req.query.clientId;
    }

    if (req.query.search) {
      const regex = new RegExp(req.query.search.trim(), 'i');
      const matchingClients = await User.find({
        role: ROLES.CLIENT,
        $or: [{ name: regex }, { email: regex }]
      }).select('_id');

      const clientIds = matchingClients.map((c) => c._id);

      filter.$or = [
        { notes: regex },
        { clientId: { $in: clientIds } }
      ];
    }

    const [proposals, total] = await Promise.all([
      Proposal.find(filter)
        .populate('clientId', 'name email phone role')
        .populate('services.serviceId', 'name slug category description status')
        .populate('createdBy', 'name email role')
        .populate('updatedBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Proposal.countDocuments(filter)
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
      GetProposals: proposals
    });
  } catch (error) {
    next(error);
  }
};

const GetByIdProposal = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Proposal ID format.'
      });
    }

    const proposal = await Proposal.findById(id)
      .populate('clientId', 'name email phone role')
      .populate('services.serviceId', 'name slug category description status')
      .populate('createdBy', 'name email role')
      .populate('updatedBy', 'name email role');

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found.'
      });
    }

    if (req.user?.role === ROLES.CLIENT && String(proposal.clientId._id) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own proposals.'
      });
    }

    return res.status(200).json({
      success: true,
      GetByIdProposal: proposal,
    });
  } catch (error) {
    next(error);
  }
};

const UpdateProposal = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Proposal ID format.'
      });
    }

    const proposal = await Proposal.findById(id);
    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found.'
      });
    }

    const { clientId, services, totalAmount, notes, status } = req.body;

    if (clientId && String(clientId) !== String(proposal.clientId)) {
      const client = await User.findOne({ _id: clientId, role: ROLES.CLIENT });
      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Client not found. Please provide a valid Client ID.'
        });
      }
      proposal.clientId = clientId;
    }

    if (services && Array.isArray(services)) {
      if (services.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one service is required.'
        });
      }

      const serviceIds = services.map((s) => s.serviceId);
      const existingServices = await MasterService.find({ _id: { $in: serviceIds } });
      if (existingServices.length !== serviceIds.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more selected services are invalid or do not exist.'
        });
      }

      proposal.services = services;
      proposal.totalAmount = totalAmount !== undefined && totalAmount !== null ? Number(totalAmount) : calculateTotal(services);
    } else if (totalAmount !== undefined && totalAmount !== null) {
      proposal.totalAmount = Number(totalAmount);
    }

    if (notes !== undefined) proposal.notes = notes ? notes.trim() : '';
    if (status) proposal.status = status;

    proposal.updatedBy = req.user._id;

    await proposal.save();

    const updated = await Proposal.findById(id)
      .populate('clientId', 'name email phone role')
      .populate('services.serviceId', 'name slug category description status')
      .populate('createdBy', 'name email role')
      .populate('updatedBy', 'name email role');

    return res.status(200).json({
      success: true,
      message: 'Proposal updated successfully.',
      UpdateProposal: updated
    });
  } catch (error) {
    next(error);
  }
};

const UpdateProposalStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Proposal ID format.'
      });
    }

    const proposal = await Proposal.findById(id);
    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found.'
      });
    }

    const { status, notes } = req.body;
    proposal.status = status;
    if (notes !== undefined) proposal.notes = notes ? notes.trim() : '';
    proposal.updatedBy = req.user._id;

    await proposal.save();

    const updated = await Proposal.findById(id)
      .populate('clientId', 'name email phone role')
      .populate('services.serviceId', 'name slug category description status')
      .populate('createdBy', 'name email role')
      .populate('updatedBy', 'name email role');

    return res.status(200).json({
      success: true,
      message: `Proposal status updated to '${status}' successfully.`,
      UpdateProposalStatus: updated
    });
  } catch (error) {
    next(error);
  }
};

const DeleteProposal = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Proposal ID format.'
      });
    }

    const proposal = await Proposal.findById(id);
    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found.'
      });
    }

    const deletedProposal = await Proposal.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Proposal deleted successfully.',
      DeleteProposal: deletedProposal
    });
  } catch (error) {
    next(error);
  }
};

const GetProposalsByClientId = async (req, res, next) => {
  try {
    const { clientId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Client ID format.'
      });
    }

    if (req.user?.role === ROLES.CLIENT && String(req.user._id) !== String(clientId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own proposals.'
      });
    }

    const client = await User.findOne({ _id: clientId, role: ROLES.CLIENT });
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found.'
      });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = { clientId };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.search) {
      const regex = new RegExp(req.query.search.trim(), 'i');
      filter.notes = regex;
    }

    const [proposals, total] = await Promise.all([
      Proposal.find(filter)
        .populate('clientId', 'name email phone role')
        .populate('services.serviceId', 'name slug category description status')
        .populate('createdBy', 'name email role')
        .populate('updatedBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Proposal.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      data: {
        client: { _id: client._id, name: client.name, email: client.email },
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      },
      GetProposalsByClientId: proposals
    });
  } catch (error) {
    next(error);
  }
};

const UpdateProposalStatusByClient = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Proposal ID format.'
      });
    }

    const proposal = await Proposal.findById(id);
    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found.'
      });
    }

    if (String(proposal.clientId) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only respond to your own proposals.'
      });
    }

    const { status, notes } = req.body;

    proposal.status = status;
    if (notes !== undefined) {
      proposal.notes = notes ? notes.trim() : proposal.notes;
    }
    proposal.updatedBy = req.user._id;

    await proposal.save();

    const updated = await Proposal.findById(id)
      .populate('clientId', 'name email phone role')
      .populate('services.serviceId', 'name slug category description status')
      .populate('createdBy', 'name email role')
      .populate('updatedBy', 'name email role');

    return res.status(200).json({
      success: true,
      message: `Proposal has been ${status.replace('_', ' ')} successfully.`,
      UpdateProposalStatusByClient: updated
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  CreateProposal,
  GetProposals,
  GetByIdProposal,
  UpdateProposal,
  UpdateProposalStatus,
  DeleteProposal,
  GetProposalsByClientId,
  UpdateProposalStatusByClient,


  createProposal: CreateProposal,
  getProposals: GetProposals,
  getProposalById: GetByIdProposal,
  updateProposal: UpdateProposal,
  updateProposalStatus: UpdateProposalStatus,
  deleteProposal: DeleteProposal,
  getProposalsByClientId: GetProposalsByClientId,
  updateProposalStatusByClient: UpdateProposalStatusByClient
};
