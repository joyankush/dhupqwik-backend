// ============================================================
//  models/Order.js — Updated with coupon fields
// ============================================================

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerName: String,
  phone:        String,
  address:      String,
  orderNote:    String,
  items:        Array,
  originalPrice: {
    type:    Number,
    default: 0
  },
  discountAmount: {
    type:    Number,
    default: 0
  },
  couponCode: {
    type:    String,
    default: null
  },
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
  paymentId:       String,
  razorpayOrderId: String,
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
