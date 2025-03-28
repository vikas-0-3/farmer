const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true
  },
  productImage: {
    type: String,
    required: true
  },
  productQuantity: {
    type: String,
    required: true
  },
  mrp: {
    type: Number,
    required: true
  },
  sellingPrice: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Fruits', 'Vegetables', 'Dairy']
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
