// ============================================================
//  models/Order.js — Updated with payment fields
// ============================================================

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerName: String,
  phone:        String,
  address:      String,
  items:        Array,
  totalPrice: {
    type:    Number,
    default: 0
  },
  status: {
    type:    String,
    default: 'pending'
  },
  statusHistory: {
    type:    Array,
    default: []
  },
  // ✅ NEW payment fields
  paymentMethod: {
    type:    String,
    enum:    ['Cash on Delivery', 'Online Payment'],
    default: 'Cash on Delivery'
  },
  paymentStatus: {
    type:    String,
    enum:    ['unpaid', 'paid'],
    default: 'unpaid'
  },
  paymentId:       String, // Razorpay payment ID after successful payment
  razorpayOrderId: String, // Razorpay order ID
  orderNote:       String
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
