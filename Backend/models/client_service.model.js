const mongoose = require('mongoose');
 
const clientServiceSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Client is required']
    },
 
    proposalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Proposal',
      required: [true, 'Proposal is required']
    },
 
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MasterService',
      required: [true, 'Service is required']
    },
 
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
 
    duration: {
      type: Number,
      default: null,
      min: [1, 'Duration must be at least 1']
    },
 
    durationUnit: {
      type: String,
      enum: ['month', 'year'],
      default: 'month'
    },
 
    billingType: {
      type: String,
      enum: ['monthly', 'one-time'],
      required: [true, 'Billing type is required']
    },
 
    startDate: {
      type: Date,
      default: Date.now
    },
 
    endDate: {
      type: Date,
      default: null
    },
 
    status: {
      type: String,
      enum: ['active', 'paused', 'completed', 'cancelled'],
      default: 'active'
    },
 
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'CreatedBy is required']
    },
 
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true,
 
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret.__v;
        return ret;
      }
    }
  }
);
 
// Prevent duplicate service entries from the same proposal
clientServiceSchema.index(
  { proposalId: 1, serviceId: 1 },
  { unique: true }
);
 
const ClientService =
  mongoose.models.ClientService ||
  mongoose.model('ClientService', clientServiceSchema);
 
module.exports = ClientService;