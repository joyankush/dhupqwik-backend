// ============================================================
//  routes/productRoutes.js
// ============================================================

const express = require('express');
const router  = express.Router();
const Product = require('../models/Product');
const auth    = require('../middleware/authMiddleware');
const upload  = require('../middleware/uploadMiddleware');

// ✅ FIX: GET / must be BEFORE GET /:id
// If /:id comes first, a request to /products could match it accidentally
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products); // plain array — frontend handles both array and {products:[]}
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const { name, price, description, stock, sizes } = req.body;

    if (!name || !price || !description) {
      return res.status(400).json({ message: 'Name, price, and description are required.' });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'At least one image is required.' });
    }

    const product = new Product({
      name,
      price:       parseFloat(price),
      description,
      stock:       parseInt(stock) || 0,
      sizes:       sizes ? JSON.parse(sizes) : ['S', 'M', 'L', 'XL'],
      images:      req.files.map(f => f.path) // Cloudinary URLs
    });

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, upload.array('images', 5), async (req, res) => {
  try {
    const updatedData = {
      ...req.body,
      sizes: JSON.parse(req.body.sizes || '[]')
    };
    if (req.files && req.files.length > 0) {
      updatedData.images = req.files.map(f => f.path);
    }
    const product = await Product.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
