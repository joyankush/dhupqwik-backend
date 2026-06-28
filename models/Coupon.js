// ============================================================
//  models/Coupon.js
// ============================================================

const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type:     String,
    required: true,
    unique:   true,
    uppercase: true,
    trim:     true
  },
  type: {
    type:    String,
    enum:    ['percent', 'flat'],
    default: 'percent'
  },
  value: {
    type:     Number,
    required: true   // e.g. 10 = 10% off OR ₹10 off
  },
  minOrder: {
    type:    Number,
    default: 0       // minimum cart total to apply
  },
  maxUses: {
    type:    Number,
    default: 100     // max number of times this coupon can be used
  },
  usedCount: {
    type:    Number,
    default: 0
  },
  isActive: {
    type:    Boolean,
    default: true
  },
  expiryDate: {
    type:    Date,
    default: null    // null = no expiry
  }
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
