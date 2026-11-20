const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      minlength: [2, 'Company name must be at least 2 characters'],
      maxlength: [200, 'Company name cannot exceed 200 characters']
    },
    companyEmail: {
      type: String,
      required: [true, 'Company email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        'Please provide a valid email address'
      ]
    },
    companyPhone: {
      type: String,
      required: [true, 'Company phone is required'],
      trim: true
    },
    companyAddress: {
      type: String,
      required: [true, 'Company address is required'],
      trim: true,
      maxlength: [500, 'Company address cannot exceed 500 characters']
    },
    companyDescription: {
      type: String,
      trim: true,
      maxlength: [2000, 'Company description cannot exceed 2000 characters'],
      default: null
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Client ID is required'],
      index: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret.__v;
        ret.accessStatus = ret.isActive ? 'active' : 'inactive';
        return ret;
      }
    }
  }
);

const Company = mongoose.models.Company || mongoose.model('Company', companySchema);

module.exports = Company;
