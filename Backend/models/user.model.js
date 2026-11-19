const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ROLE_VALUES, ROLES } = require('../config/roles');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/, 'Please provide a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    role: {
      type: String,
      enum: {
        values: ROLE_VALUES,
        message: '{VALUE} is not a valid role. Allowed roles: Admin, Manager, Employee, Client'
      },
      default: ROLES.ADMIN
    },
    phone: {
      type: Number,
      default: null,
      validate: {
        validator: function (v) {
          if (v === null || v === undefined) return true;
          return v >= 1000000000 && v <= 9999999999;
        },
        message: 'Phone number must be exactly 10 digits'
      }
    },
    designation: {
      type: String,
      trim: true,
      maxlength: [100, 'Designation cannot exceed 100 characters'],
      default: null
    },
    department: {
      type: String,
      trim: true,
      maxlength: [100, 'Department cannot exceed 100 characters'],
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    // Maintained for backward-compatibility with existing code
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    reportingTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    discriminatorKey: 'role',
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Keep userId and createdBy in sync
userSchema.pre('save', function () {
  if (this.createdBy && !this.userId) {
    this.userId = this.createdBy;
  } else if (this.userId && !this.createdBy) {
    this.createdBy = this.userId;
  }
});

// Password hashing
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role,
      name: this.name
    },
    process.env.JWT_SECRET || 'shut_hike_jwt_secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
