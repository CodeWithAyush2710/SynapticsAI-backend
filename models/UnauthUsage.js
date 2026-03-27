const mongoose = require('mongoose');

const unauthUsageSchema = new mongoose.Schema({
  ipAddress: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 }
});

module.exports = mongoose.model('UnauthUsage', unauthUsageSchema);
