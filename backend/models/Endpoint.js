const mongoose = require('mongoose');

const endpointSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true
  },
  hostname: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    default: ''
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Update lastSeen on save
endpointSchema.pre('save', function(next) {
  this.lastSeen = new Date();
  next();
});

module.exports = mongoose.model('Endpoint', endpointSchema);
