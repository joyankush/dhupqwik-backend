// ============================================================
//  models/Banner.js
// ============================================================
const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  subtitle:    { type: String, default: '' },
  tag:         { type: String, default: '' },        // e.g. "FREE DELIVERY · DHUPGURI"
  btnText:     { type: String, default: 'Shop Now →' },
  bgColor:     { type: String, default: '#0d2a2a' }, // fallback bg color
  bgImage:     { type: String, default: '' },        // Cloudinary URL
  textColor:   { type: String, default: '#ffffff' },
  accentColor: { type: String, default: '#10b981' }, // teal
  linkType:    { type: String, enum: ['product', 'url', 'none'], default: 'none' },
  productId:   { type: String, default: '' },        // if linkType === 'product'
  customUrl:   { type: String, default: '' },        // if linkType === 'url'
  isActive:    { type: Boolean, default: true },
  order:       { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
