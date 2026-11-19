const mongoose = require('mongoose');
const User = require('./user.model');
const { ROLES } = require('../config/roles');

const adminSchema = new mongoose.Schema({
  isSuperAdmin: {
    type: Boolean,
    default: true
  }
});

const Admin = User.discriminators?.[ROLES.ADMIN] || User.discriminator(ROLES.ADMIN, adminSchema);

module.exports = Admin;
