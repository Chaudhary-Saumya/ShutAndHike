const mongoose = require('mongoose');
const User = require('../models/user.model');
const { ROLES } = require('../config/roles');

const CreateClient = async (req, res, next) => {
    try{
        const { name, email, password, phone, reportingTo, companyName, industry, billingAddress } = req.body;

        const existingUser = await User.findOne({ email: email.trim().toLowerCase() });    
        if (existingUser){
        return res.status(409).json({
            success:false,
        message: 'An account with this email address already exists.'
      });
    }

        const creatorId = req.user?._id || req.data?._id;
        const creatorRole = req.user?.role || req.data?.role;

            let supervisorId = reportingTo || null;
            if (!supervisorId && creatorRole === ROLES.MANAGER) {
              supervisorId = creatorId;
            }

        const client = await User.create({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: password.trim(),
          role: ROLES.CLIENT,
          phone: phone ? Number(phone) : null,
          companyName: companyName ? companyName.trim() : null,
          industry: industry ? industry.trim() : null,
          billingAddress: billingAddress ? billingAddress.trim() : null,
          createdBy: creatorId,
          userId: creatorId,
          reportingTo: supervisorId
        });

        const populated = await User.findById(client._id)
            .populate('createdBy', 'name email role')
            .populate('reportingTo', 'name email role');

        return res.status(201).json({
          success: true,
          message: 'client created successfully.',
          CreateClient: populated
        });
    } catch (error) {
    next(error);
  }
}

const GetClient = async (req,res,next) => {
    try{

        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
        const skip = (page - 1) * limit;
    
        const filter = { role: ROLES.CLIENT, };
    
        if (req.query.search) {
          const regex = new RegExp(req.query.search.trim(), 'i');
          filter.$or = [
            { name: regex },
            { email: regex }
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
    
        const [clients, total] = await Promise.all([
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
        }},
        msg:"get the all client",
        GetClient: clients
    })
    } catch (error) {
    next(error);
  }
}

const GetByIdClient = async (req,res,next) => {
    try{
        const { id } = req.params;
    
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid Client ID format.'
          });
        }

        if (req.user?.role === ROLES.CLIENT && String(req.user._id) !== String(id)) {
          return res.status(403).json({
            success: false,
            message: 'Access denied. You can only view your own profile.'
          });
        }

        const client = await User.findOne({ _id: id, role: ROLES.CLIENT })
          .populate('createdBy', 'name email role')
          .populate('reportingTo', 'name email role');
    
        if (!client) {
          return res.status(404).json({
            success: false,
            message: 'Client not found.'
          });
        }

        return res.status(200).json({
          success: true,
          msg: 'client fetched successfully',
          GetByIdClient: client
        });
    } catch (error) {
    next(error);
  }
}

const UpdateClient = async (req,res,next) => {
    try{
    
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

        const { name, email, password, phone, reportingTo, isActive, companyName, industry, billingAddress } = req.body;
    
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
        if (phone !== undefined) client.phone = phone ? Number(phone) : null;
        if (companyName !== undefined) client.companyName = companyName ? companyName.trim() : null;
        if (industry !== undefined) client.industry = industry ? industry.trim() : null;
        if (billingAddress !== undefined) client.billingAddress = billingAddress ? billingAddress.trim() : null;
        if (reportingTo !== undefined) {
          client.reportingTo = reportingTo && mongoose.Types.ObjectId.isValid(reportingTo) ? reportingTo : null;
        }
        if (isActive !== undefined) client.isActive = Boolean(isActive);
    
        if (password && password.trim().length > 0) {
          client.password = password.trim();
        }
    
        await client.save();

        const updated = await User.findById(id)
          .populate('createdBy', 'name email role')
          .populate('reportingTo', 'name email role');
    
        return res.status(200).json({
          success: true,
          message: 'Client updated successfully.',
          UpdateClient: updated
        });
    } catch (error) {
    next(error);
  }
}

const DeleteClient = async (req,res,next) => {
    try{

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
          DeleteClient: deletedClient
        });
    } catch (error) {
    next(error);
  }
}

module.exports = {
  CreateClient,
  GetClient,
  GetByIdClient,
  UpdateClient,
  DeleteClient
}
