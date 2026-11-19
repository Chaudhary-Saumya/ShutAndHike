const mongoose = require('mongoose');
const User = require('./user.model');
const { ROLES } = require('../config/roles');

const employeeSchema = new mongoose.Schema({
  department: {
    type: String,
    trim: true,
    default: 'Execution'
  },
  skills: [
    {
      type: String,
      trim: true
    }
  ],
  joiningDate: {
    type: Date,
    default: Date.now
  }
});

const Employee = User.discriminators?.[ROLES.EMPLOYEE] || User.discriminator(ROLES.EMPLOYEE, employeeSchema);

module.exports = Employee;
