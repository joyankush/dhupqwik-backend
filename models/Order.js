const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerName: String,
  phone: String,
  address: String,
  items: Array,
  // ✅ FIX 4: totalPrice was missing
  // Without this, checkout total is never saved — you'd have no idea what to collect on delivery
  totalPrice: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    default: 'pending'
  },
  statusHistory: {
    type: Array,
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
