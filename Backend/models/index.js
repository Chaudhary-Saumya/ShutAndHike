const User = require('./user.model');
const Company = require('./company.model');
const MasterService = require('./master_service.model');

module.exports = {
  User,
  Company,
  MasterService,
  // Role-based aliases for backward compatibility if needed
  Admin: User,
  Manager: User,
  Employee: User,
  Client: User
};

