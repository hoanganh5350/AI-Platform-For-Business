const mongoose = require('mongoose');

const approvalRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetType: {
      type: String,
      enum: ['ADMIN', 'BUSINESS'],
      required: true,
    },
    action: {
      type: String,
      enum: ['CREATE', 'UPDATE', 'DELETE'],
      default: 'UPDATE',
    },
    payload: {
      type: mongoose.Schema.Types.Mixed, // Stores the updated fields
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    createdBy: {
      type: String,
      required: true,
    },
    updatedBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const ApprovalRequest = mongoose.model('ApprovalRequest', approvalRequestSchema);
module.exports = ApprovalRequest;
