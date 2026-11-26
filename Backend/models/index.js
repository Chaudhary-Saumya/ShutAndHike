const User = require('./user.model');
const Company = require('./company.model');
const MasterService = require('./master_service.model');
const Proposal = require('./proposal.model');

module.exports = {
  User,
  Company,
  MasterService,
  Proposal,
  // Role-based aliases for backward compatibility if needed
  Admin: User,
  Manager: User,
  Employee: User,
  Client: User
};


