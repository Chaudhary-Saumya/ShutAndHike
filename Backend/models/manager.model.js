const mongoose = require('mongoose');
const User = require('./user.model');
const { ROLES } = require('../config/roles');

const managerSchema = new mongoose.Schema({
  department: {
    type: String,
    trim: true,
    default: 'Operations'
  },
  managedTeam: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
});

const Manager = User.discriminators?.[ROLES.MANAGER] || User.discriminator(ROLES.MANAGER, managerSchema);

module.exports = Manager;
