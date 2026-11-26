const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Client is required']
    },
    services: [
      {
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
        }
      }
    ],
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative']
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },

    status: {
      type: String,
      enum: [
        'draft',
        'accepted',
        'rejected',
        'revision_requested'
      ],
      default: 'draft'
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

const Proposal =
  mongoose.models.Proposal ||
  mongoose.model('Proposal', proposalSchema);

module.exports = Proposal;
