const User = require('./user.model');

module.exports = {
  User,
  // Role-based aliases for backward compatibility if needed
  Admin: User,
  Manager: User,
  Employee: User,
  Client: User
};
