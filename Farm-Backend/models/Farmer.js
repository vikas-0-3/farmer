const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  farmName: {
    type: String,
    required: true
  },
  location: {
    type: String
  },
  farmPhoto: {
    type: String
  }
  // Add other fields like contactNumber, licenseId, etc.
}, { timestamps: true });

module.exports = mongoose.model('Farmer', farmerSchema);
