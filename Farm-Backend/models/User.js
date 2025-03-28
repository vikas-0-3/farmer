const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  profilePhoto: {
    type: String 
  },
  address: {
    type: String
  },
  dateJoined: {
    type: Date,
    default: Date.now
  },
  role: {
    type: String,
    default: 'user'
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
