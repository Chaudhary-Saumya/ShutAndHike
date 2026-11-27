const User = require('./user.model');
const Company = require('./company.model');
const MasterService = require('./master_service.model');
const Proposal = require('./proposal.model');
const ClientService = require('./client_service.model');
const Payment = require('./payment.model');

module.exports = {
  User,
  Company,
  MasterService,
  Proposal,
  ClientService,
  Payment,
  // Role-based aliases for backward compatibility if needed
  Admin: User,
  Manager: User,
  Employee: User,
  Client: User
};


