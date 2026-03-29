const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    index: true
  },
  appName: {
    type: String,
    required: true
  },
  allowedDomains: {
    type: [String],
    default: []
  },
  blockedDomains: {
    type: [String],
    default: []
  },
  allowedIPs: {
    type: [String],
    default: []
  },
  blockedIPs: {
    type: [String],
    default: []
  },
  enabled: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Compound index for efficient device + app lookups
policySchema.index({ deviceId: 1, appName: 1 });

module.exports = mongoose.model('Policy', policySchema);
