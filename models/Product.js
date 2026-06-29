const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:          String,
  price:         Number,   // selling price (after discount)
  originalPrice: Number,   // MRP / crossed out price (optional)
  images:        [String],
  description:   String,
  sizes:         [String],
  stock:         Number
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
