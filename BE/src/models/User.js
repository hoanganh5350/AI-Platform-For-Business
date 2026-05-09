const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['ADMIN_SYSTEM', 'ADMIN', 'BUSINESS'],
      required: true,
    },
    businessId: {
      type: String, // Optional, mostly for BUSINESS role
    },
    businessName: {
      type: String, // Optional, mostly for BUSINESS role
    },
    email: {
      type: String, // Optional
    },
    phone: {
      type: String, // Optional
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    createdBy: {
      type: String,
      default: 'system',
    },
    updatedBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);
module.exports = User;
