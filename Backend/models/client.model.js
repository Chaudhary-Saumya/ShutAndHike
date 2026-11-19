const mongoose = require('mongoose');
const User = require('./user.model');
const { ROLES } = require('../config/roles');

const clientSchema = new mongoose.Schema({
  companyName: {
    type: String,
    trim: true,
    default: null
  },
  industry: {
    type: String,
    trim: true,
    default: null
  },
  billingAddress: {
    type: String,
    trim: true,
    default: null
  }
});

const Client = User.discriminators?.[ROLES.CLIENT] || User.discriminator(ROLES.CLIENT, clientSchema);

module.exports = Client;
