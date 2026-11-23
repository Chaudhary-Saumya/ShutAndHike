const mongoose = require('mongoose');
const MasterService = require('../models/master_service.model');

const CreateMasterService = async (req, res, next) => {
  try {
    const { name, slug, category, description, status } = req.body;

    const existingService = await MasterService.findOne({ slug: slug.trim().toLowerCase() });
    if (existingService) {
      return res.status(409).json({
        success: false,
        message: 'A service with this slug already exists.'
      });
    }

    const masterService = await MasterService.create({
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      category: category.trim(),
      description: description.trim(),
      status: status || 'active',
      createdBy: req.user._id
    });

    const populated = await MasterService.findById(masterService._id)
      .populate('createdBy', 'name email role')
      .populate('updatedBy', 'name email role');

    return res.status(201).json({success: true, message: 'Master service created successfully.', CreateMasterService, masterService: populated});
  } catch (error) {
    next(error);
  }
};

const GetMasterService = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.search) {
      const regex = new RegExp(req.query.search.trim(), 'i');
      filter.$or = [
        { name: regex },
        { slug: regex },
        { category: regex },
        { description: regex }
      ];
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.category) {
      filter.category = new RegExp(req.query.category.trim(), 'i');
    }

    const [masterServices, total] = await Promise.all([
      MasterService.find(filter)
        .populate('createdBy', 'name email role')
        .populate('updatedBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      MasterService.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        },
        GetMasterService: masterServices
    });
  } catch (error) {
    next(error);
  }
};

const GetByIdMasterService = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Master Service ID format.'
      });
    }

    const masterService = await MasterService.findById(id)
      .populate('createdBy', 'name email role')
      .populate('updatedBy', 'name email role');

    if (!masterService) {
      return res.status(404).json({
        success: false,
        message: 'Master service not found.'
      });
    }

    return res.status(200).json({
      success: true, GetByIdMasterService: masterService});
  } catch (error) {
    next(error);
  }
};

const UpdateMasterService = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Master Service ID format.'
      });
    }

    const masterService = await MasterService.findById(id);
    if (!masterService) {
      return res.status(404).json({
        success: false,
        message: 'Master service not found.'
      });
    }

    const { name, slug, category, description, status } = req.body;

    if (slug && slug.trim().toLowerCase() !== masterService.slug) {
      const slugConflict = await MasterService.findOne({
        slug: slug.trim().toLowerCase(),
        _id: { $ne: id }
      });
      if (slugConflict) {
        return res.status(409).json({
          success: false,
          message: 'A service with this slug already exists.'
        });
      }
      masterService.slug = slug.trim().toLowerCase();
    }

    if (name) masterService.name = name.trim();
    if (category) masterService.category = category.trim();
    if (description !== undefined) masterService.description = description.trim();
    if (status) masterService.status = status;

    masterService.updatedBy = req.user._id;

    await masterService.save();

    const updated = await MasterService.findById(id)
      .populate('createdBy', 'name email role')
      .populate('updatedBy', 'name email role');

    return res.status(200).json({
      success: true,
      message: 'Master service updated successfully.',
      UpdateMasterService, masterService: updated
    });
  } catch (error) {
    next(error);
  }
};

const DeleteMasterService = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Master Service ID format.'
      });
    }

    const masterService = await MasterService.findById(id);
    if (!masterService) {
      return res.status(404).json({
        success: false,
        message: 'Master service not found.'
      });
    }

    const deletedService = await MasterService.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Master service deleted successfully.',
      DeleteMasterService: deletedService
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  CreateMasterService,
  GetMasterService,
  GetByIdMasterService,
  UpdateMasterService,
  DeleteMasterService,

  createMasterService: CreateMasterService,
  getAllMasterServices: GetMasterService,
  getMasterServiceById: GetByIdMasterService,
  updateMasterService: UpdateMasterService,
  deleteMasterService: DeleteMasterService
};
