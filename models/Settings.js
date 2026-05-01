// ============================================================
//  models/Settings.js — Store-wide settings
// ============================================================

const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // Only ever one document — we use key "store"
  key: {
    type: String,
    default: 'store',
    unique: true
  },
  codEnabled: {
    type: Boolean,
    default: true  // COD is ON by default
  },
  onlinePaymentEnabled: {
    type: Boolean,
    default: true
  },
  storeName: {
    type: String,
    default: 'DhupQwik'
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
