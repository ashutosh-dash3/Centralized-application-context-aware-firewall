const mongoose = require('mongoose');

const applicationLogSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    index: true
  },
  appName: {
    type: String,
    required: true,
    index: true
  },
  domain: {
    type: String,
    default: ''
  },
  ip: {
    type: String,
    required: true
  },
  protocol: {
    type: String,
    enum: ['TCP', 'UDP', 'HTTP', 'HTTPS', 'UNKNOWN'],
    default: 'UNKNOWN'
  },
  port: {
    type: Number
  },
  status: {
    type: String,
    enum: ['allowed', 'blocked'],
    default: 'allowed'
  },
  isAnomaly: {
    type: Boolean,
    default: false,
    index: true
  },
  anomalyReason: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
applicationLogSchema.index({ deviceId: 1, timestamp: -1 });
applicationLogSchema.index({ isAnomaly: 1, timestamp: -1 });

module.exports = mongoose.model('ApplicationLog', applicationLogSchema);
