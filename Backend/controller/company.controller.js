const mongoose = require('mongoose');
const Company = require('../models/company.model');
const User = require('../models/user.model');
const { ROLES } = require('../config/roles');

const resolveAccessStatus = (body) => {
  if (body.isActive !== undefined) return Boolean(body.isActive);
  if (body.status !== undefined) return body.status === 'active';
  if (body.accessStatus !== undefined) return body.accessStatus === 'active';
  return true;
};

const CreateCompany = async (req, res, next) => {
  try {
    const { companyName, companyEmail, companyPhone, companyAddress, companyDescription, clientId } = req.body;

    const client = await User.findOne({ _id: clientId, role: ROLES.CLIENT });
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found. Please provide a valid Client ID.'
      });
    }

    const existingCompany = await Company.findOne({ companyEmail: companyEmail.trim().toLowerCase() });
    if (existingCompany) {
      return res.status(409).json({
        success: false,
        message: 'A company with this email address already exists.'
      });
    }

    const isActive = resolveAccessStatus(req.body);

    const company = await Company.create({
      companyName: companyName.trim(),
      companyEmail: companyEmail.trim().toLowerCase(),
      companyPhone: companyPhone.trim(),
      companyAddress: companyAddress.trim(),
      companyDescription: companyDescription ? companyDescription.trim() : null,
      clientId,
      isActive
    });

    const populated = await Company.findById(company._id).populate('clientId', 'name email phone role');

    return res.status(201).json({
      success: true,
      message: 'Company created successfully.',
      data: { company: populated },
      CreateCompany: populated,
      company: populated
    });
  } catch (error) {
    next(error);
  }
};

const GetCompany = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.search) {
      const regex = new RegExp(req.query.search.trim(), 'i');
      filter.$or = [
        { companyName: regex },
        { companyEmail: regex },
        { companyPhone: regex },
        { companyAddress: regex }
      ];
    }

    if (req.query.status || req.query.accessStatus) {
      const statusParam = req.query.status || req.query.accessStatus;
      filter.isActive = statusParam === 'active';
    }

    const [companies, total] = await Promise.all([
      Company.find(filter)
        .populate('clientId', 'name email phone role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Company.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      data: {
        companies,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      },
      GetCompany: companies
    });
  } catch (error) {
    next(error);
  }
};

const GetByIdCompany = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Company ID format.'
      });
    }

    const company = await Company.findById(id).populate('clientId', 'name email phone role');

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found.'
      });
    }

    if (req.user?.role === ROLES.CLIENT && String(company.clientId._id) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own companies.'
      });
    }

    return res.status(200).json({
      success: true,
      data: { company },
      GetByIdCompany: company,
      company
    });
  } catch (error) {
    next(error);
  }
};

const GetCompanyByClientId = async (req, res, next) => {
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
        message: 'Access denied. You can only view your own companies.'
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

    if (req.query.search) {
      const regex = new RegExp(req.query.search.trim(), 'i');
      filter.$or = [
        { companyName: regex },
        { companyEmail: regex },
        { companyPhone: regex }
      ];
    }

    if (req.query.status || req.query.accessStatus) {
      const statusParam = req.query.status || req.query.accessStatus;
      filter.isActive = statusParam === 'active';
    }

    const [companies, total] = await Promise.all([
      Company.find(filter)
        .populate('clientId', 'name email phone role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Company.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      data: {
        client: { _id: client._id, name: client.name, email: client.email },
        companies,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      },
      GetCompanyByClientId: companies
    });
  } catch (error) {
    next(error);
  }
};

const UpdateCompany = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Company ID format.'
      });
    }

    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found.'
      });
    }

    const { companyName, companyEmail, companyPhone, companyAddress, companyDescription, clientId } = req.body;

    if (clientId && String(clientId) !== String(company.clientId)) {
      const client = await User.findOne({ _id: clientId, role: ROLES.CLIENT });
      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Client not found. Please provide a valid Client ID.'
        });
      }
      company.clientId = clientId;
    }

    if (companyEmail && companyEmail.trim().toLowerCase() !== company.companyEmail) {
      const emailConflict = await Company.findOne({
        companyEmail: companyEmail.trim().toLowerCase(),
        _id: { $ne: id }
      });
      if (emailConflict) {
        return res.status(409).json({
          success: false,
          message: 'A company with this email address already exists.'
        });
      }
      company.companyEmail = companyEmail.trim().toLowerCase();
    }

    if (companyName) company.companyName = companyName.trim();
    if (companyPhone !== undefined) company.companyPhone = companyPhone.trim();
    if (companyAddress !== undefined) company.companyAddress = companyAddress.trim();
    if (companyDescription !== undefined) company.companyDescription = companyDescription ? companyDescription.trim() : null;

    if (req.body.isActive !== undefined || req.body.status !== undefined || req.body.accessStatus !== undefined) {
      company.isActive = resolveAccessStatus(req.body);
    }

    await company.save();

    const updated = await Company.findById(id).populate('clientId', 'name email phone role');

    return res.status(200).json({
      success: true,
      message: 'Company updated successfully.',
      data: { company: updated },
      UpdateCompany: updated
    });
  } catch (error) {
    next(error);
  }
};

const DeleteCompany = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Company ID format.'
      });
    }

    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found.'
      });
    }

    const deletedCompany = await Company.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Company deleted successfully.',
      data: { company: deletedCompany },
      DeleteCompany: deletedCompany
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  CreateCompany,
  GetCompany,
  GetByIdCompany,
  GetCompanyByClientId,
  UpdateCompany,
  DeleteCompany,

  createCompany: CreateCompany,
  getAllCompanies: GetCompany,
  getCompanyById: GetByIdCompany,
  getCompanyByClientId: GetCompanyByClientId,
  updateCompany: UpdateCompany,
  deleteCompany: DeleteCompany
};
