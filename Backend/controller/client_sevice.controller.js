const mongoose = require('mongoose');
const ClientService = require('../models/client_service.model');
const User = require('../models/user.model');
const Proposal = require('../models/proposal.model');
const MasterService = require('../models/master_service.model');
const { ROLES } = require('../config/roles');

const calculateEndDate = (startDate, duration, durationUnit = 'month') => {
  if (!duration || Number(duration) <= 0) return null;
  const end = new Date(startDate);
  const num = Number(duration);
  const unit = (durationUnit || 'month').toLowerCase();

  if (unit === 'year') {
    end.setFullYear(end.getFullYear() + num);
  } else {
    end.setMonth(end.getMonth() + num);
  }
  return end;
};

const CreateClientService = async (req, res, next) => {
  try {
    const clientId = req.body.clientId || req.body.clientid;
    const proposalId = req.body.proposalId || req.body.proposalid;
    const serviceId = req.body.serviceId || req.body.serviceid;
    const { startDate, endDate, status } = req.body;

    if (!clientId || !proposalId || !serviceId) {
      return res.status(400).json({
        success: false,
        message: 'clientId, proposalId, and serviceId are required in the request body.'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Client ID format.'
      });
    }
    if (!mongoose.Types.ObjectId.isValid(proposalId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Proposal ID format.'
      });
    }
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Service ID format.'
      });
    }

    const client = await User.findOne({ _id: clientId, role: ROLES.CLIENT });
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found. Please provide a valid Client ID.'
      });
    }

    const proposal = await Proposal.findById(proposalId);
    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found. Please provide a valid Proposal ID.'
      });
    }

    const proposalClientId = String(proposal.clientId?._id || proposal.clientId);
    if (proposalClientId !== String(clientId)) {
      return res.status(400).json({
        success: false,
        message: `This proposal does not belong to the specified client. Proposal belongs to client '${proposalClientId}', but received '${clientId}'.`
      });
    }

    if (proposal.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: `Proposal has not been accepted yet (current status: '${proposal.status}'). Client services can only be created from accepted proposals.`
      });
    }

    const proposalService = proposal.services.find(
      (s) => String(s.serviceId) === String(serviceId)
    );
    if (!proposalService) {
      return res.status(404).json({
        success: false,
        message: 'The specified service was not found in this proposal.'
      });
    }

    const existingClientService = await ClientService.findOne({
      proposalId,
      serviceId
    });
    if (existingClientService) {
      return res.status(409).json({
        success: false,
        message: 'A client service for this proposal and service has already been created.'
      });
    }

    const { price, duration, durationUnit, billingType } = proposalService;

    const effectiveStartDate = startDate
      ? new Date(startDate)
      : new Date(proposal.updatedAt || Date.now());

    let effectiveEndDate = null;
    if (endDate) {
      effectiveEndDate = new Date(endDate);
    } else if (duration && Number(duration) > 0) {
      effectiveEndDate = calculateEndDate(effectiveStartDate, duration, durationUnit);
    }

    const clientService = await ClientService.create({
      clientId,
      proposalId,
      serviceId,
      price,
      duration: duration || null,
      durationUnit: durationUnit || 'month',
      billingType,
      startDate: effectiveStartDate,
      endDate: effectiveEndDate,
      status: status || 'active',
      createdBy: req.user?._id || proposal.createdBy || clientId,
      updatedBy: null
    });

    const populated = await ClientService.findById(clientService._id)
      .populate('clientId', 'name email phone role')
      .populate('proposalId', 'totalAmount status notes createdAt updatedAt')
      .populate('serviceId', 'name slug category description status')
      .populate('createdBy', 'name email role');

    return res.status(201).json({
      success: true,
      message: 'Client service created successfully from accepted proposal.',
      CreateClientService: populated
    });
  } catch (error) {
    next(error);
  }
};

const ReadClientService = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.user?.role === ROLES.CLIENT) {
      filter.clientId = req.user._id;
    } else if (req.query.clientId) {
      if (!mongoose.Types.ObjectId.isValid(req.query.clientId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Client ID format.'
        });
      }
      filter.clientId = req.query.clientId;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.proposalId) {
      if (!mongoose.Types.ObjectId.isValid(req.query.proposalId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Proposal ID format.'
        });
      }
      filter.proposalId = req.query.proposalId;
    }

    if (req.query.search) {
      const regex = new RegExp(req.query.search.trim(), 'i');

      const [matchingClients, matchingServices] = await Promise.all([
        User.find({
          role: ROLES.CLIENT,
          $or: [{ name: regex }, { email: regex }]
        }).select('_id'),
        MasterService.find({
          $or: [{ name: regex }, { category: regex }]
        }).select('_id')
      ]);

      const clientIds = matchingClients.map((c) => c._id);
      const serviceIds = matchingServices.map((s) => s._id);

      filter.$or = [
        { clientId: { $in: clientIds } },
        { serviceId: { $in: serviceIds } }
      ];
    }

    const [clientServices, total] = await Promise.all([
      ClientService.find(filter)
        .populate('clientId', 'name email phone role')
        .populate('serviceId', 'name slug category description status')
        .populate('proposalId', 'totalAmount status notes createdAt updatedAt')
        .populate('createdBy', 'name email role')
        .populate('updatedBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ClientService.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      message: 'Client services retrieved successfully.',
      data: {
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      },
      clientServices
    });
  } catch (error) {
    next(error);
  }
};

const GetByIdClientService = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Client-Service ID format.'
      });
    }

    let clientService = await ClientService.findById(id)
      .populate('clientId', 'name email phone role')
      .populate('proposalId', 'totalAmount status notes createdAt updatedAt')
      .populate('serviceId', 'name slug category description status')
      .populate('createdBy', 'name email role')
      .populate('updatedBy', 'name email role');

    if (!clientService) {
      const related = await ClientService.findOne({
        $or: [{ serviceId: id }, { proposalId: id }, { clientId: id }]
      });

      if (related) {
        let matchedType = 'Service ID';
        if (String(related.proposalId) === String(id)) matchedType = 'Proposal ID';
        if (String(related.clientId) === String(id)) matchedType = 'Client ID';

        return res.status(404).json({
          success: false,
          message: `Client-Service not found with ID '${id}'. Note: This ID is a ${matchedType}. Please use the Client-Service _id: '${related._id}' in the URL.`,
          clientServiceId: related._id
        });
      }

      return res.status(404).json({
        success: false,
        message: `Client-Service with ID '${id}' not found. Make sure this client service has been created via POST /api/client_service.`
      });
    }

    const recordClientId = String(clientService.clientId?._id || clientService.clientId);
    if (req.user?.role === ROLES.CLIENT && recordClientId !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own client services.'
      });
    }

    return res.status(200).json({
      success: true,
      GetByIdClientService: clientService
    });
  } catch (error) {
    next(error);
  }
};

const GetClientServicesByClientId = async (req, res, next) => {
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
        message: 'Access denied. You can only view your own client services.'
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

    const [clientServices, total] = await Promise.all([
      ClientService.find(filter)
        .populate('clientId', 'name email phone role')
        .populate('serviceId', 'name slug category description status')
        .populate('proposalId', 'totalAmount status notes createdAt updatedAt')
        .populate('createdBy', 'name email role')
        .populate('updatedBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ClientService.countDocuments(filter)
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
      clientServices,
    });
  } catch (error) {
    next(error);
  }
};

const UpdateClientServiceStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Client-Service ID format.'
      });
    }

    let clientService = await ClientService.findById(id);
    if (!clientService) {
      const related = await ClientService.findOne({
        $or: [{ serviceId: id }, { proposalId: id }, { clientId: id }]
      });

      if (related) {
        let matchedType = 'Service ID';
        if (String(related.proposalId) === String(id)) matchedType = 'Proposal ID';
        if (String(related.clientId) === String(id)) matchedType = 'Client ID';

        return res.status(404).json({
          success: false,
          message: `Client-Service not found with ID '${id}'. Note: This ID is a ${matchedType}. Please use the Client-Service _id: '${related._id}' in the URL.`,
          clientServiceId: related._id
        });
      }

      return res.status(404).json({
        success: false,
        message: `Client-Service with ID '${id}' not found. Make sure this client service has been created via POST /api/client_service.`
      });
    }

    const { status } = req.body;
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required.'
      });
    }

    clientService.status = status;
    clientService.updatedBy = req.user?._id;

    await clientService.save();

    const updated = await ClientService.findById(id)
      .populate('clientId', 'name email phone role')
      .populate('proposalId', 'totalAmount status notes createdAt updatedAt')
      .populate('serviceId', 'name slug category description status')
      .populate('createdBy', 'name email role')
      .populate('updatedBy', 'name email role');

    return res.status(200).json({
      success: true,
      message: `Client service status updated to '${status}' successfully.`,
      UpdateClientServiceStatus: updated
    });
  } catch (error) {
    next(error);
  }
};

const UpdateClientService = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Client-Service ID format.'
      });
    }

    let clientService = await ClientService.findById(id);
    if (!clientService) {
      const related = await ClientService.findOne({
        $or: [{ serviceId: id }, { proposalId: id }, { clientId: id }]
      });

      if (related) {
        let matchedType = 'Service ID';
        if (String(related.proposalId) === String(id)) matchedType = 'Proposal ID';
        if (String(related.clientId) === String(id)) matchedType = 'Client ID';

        return res.status(404).json({
          success: false,
          message: `Client-Service not found with ID '${id}'. Note: This ID is a ${matchedType}. Please use the Client-Service _id: '${related._id}' in the URL.`,
          clientServiceId: related._id
        });
      }

      return res.status(404).json({
        success: false,
        message: `Client-Service with ID '${id}' not found. Make sure this client service has been created via POST /api/client_service.`
      });
    }

    const { price, duration, durationUnit, billingType, startDate, endDate, status } = req.body;

    if (price !== undefined) clientService.price = Number(price);
    if (duration !== undefined) clientService.duration = duration ? Number(duration) : null;
    if (durationUnit !== undefined) clientService.durationUnit = durationUnit;
    if (billingType !== undefined) clientService.billingType = billingType;
    if (status !== undefined) clientService.status = status;

    if (startDate !== undefined) {
      clientService.startDate = new Date(startDate);
    }

    if (endDate !== undefined) {
      clientService.endDate = endDate ? new Date(endDate) : null;
    } else if (duration !== undefined || durationUnit !== undefined || startDate !== undefined) {
    
      if (clientService.duration && Number(clientService.duration) > 0) {
        clientService.endDate = calculateEndDate(
          clientService.startDate,
          clientService.duration,
          clientService.durationUnit
        );
      }
    }

    clientService.updatedBy = req.user?._id;

    await clientService.save();

    const updated = await ClientService.findById(id)
      .populate('clientId', 'name email phone role')
      .populate('proposalId', 'totalAmount status notes createdAt updatedAt')
      .populate('serviceId', 'name slug category description status')
      .populate('createdBy', 'name email role')
      .populate('updatedBy', 'name email role');

    return res.status(200).json({
      success: true,
      message: 'Client-Service updated successfully.',
      UpdateClientService: updated
    });
  } catch (error) {
    next(error);
  }
};

const DeleteClientService = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Client-Service ID format.'
      });
    }

    let clientService = await ClientService.findById(id);
    if (!clientService) {
      const related = await ClientService.findOne({
        $or: [{ serviceId: id }, { proposalId: id }, { clientId: id }]
      });

      if (related) {
        let matchedType = 'Service ID';
        if (String(related.proposalId) === String(id)) matchedType = 'Proposal ID';
        if (String(related.clientId) === String(id)) matchedType = 'Client ID';

        return res.status(404).json({
          success: false,
          message: `Client-Service not found with ID '${id}'. Note: This ID is a ${matchedType}. Please use the Client-Service _id: '${related._id}' in the URL.`,
          clientServiceId: related._id
        });
      }

      return res.status(404).json({
        success: false,
        message: `Client-Service with ID '${id}' not found. Make sure this client service has been created via POST /api/client_service.`
      });
    }

    const deletedClientService = await ClientService.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Client-Service deleted successfully.',
      DeleteClientService: deletedClientService
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  CreateClientService,
  createClientService: CreateClientService,
  ReadClientService,
  readClientService: ReadClientService,
  getClientServices: ReadClientService,
  GetByIdClientService,
  getByIdClientService: GetByIdClientService,
  GetClientServicesByClientId,
  getClientServicesByClientId: GetClientServicesByClientId,
  UpdateClientServiceStatus,
  updateClientServiceStatus: UpdateClientServiceStatus,
  UpdateClientService,
  updateClientService: UpdateClientService,
  DeleteClientService,
  deleteClientService: DeleteClientService
};
