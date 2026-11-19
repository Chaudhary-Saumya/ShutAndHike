const { authorize } = require('./auth.middleware');
const { ROLES } = require('../config/roles');

// Standalone admin-only guard
const admin = authorize(ROLES.ADMIN);

admin.admin = admin;

module.exports = admin;
