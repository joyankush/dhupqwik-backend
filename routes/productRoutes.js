
// ============================================================
//  routes/productRoutes.js
// ============================================================

const express = require('express');
const router  = express.Router();
const Product = require('../models/Product');
const auth    = require('../middleware/authMiddleware');
const upload  = require('../middleware/uploadMiddleware');


// ── GET ALL PRODUCTS ───────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error("GET PRODUCTS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});


// ── GET SINGLE PRODUCT ─────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error("GET PRODUCT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});


// ── ADD PRODUCT (IMPORTANT PART) ───────────────────────────
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    console.log("REQ.FILES:", req.files);
    console.log("REQ.BODY:", req.body);

    const { name, price, description, stock, sizes } = req.body;

    // Validation
    if (!name || !price || !description) {
      return res.status(400).json({ message: 'Name, price, and description are required.' });
    }

    if (!req.files) {
      return res.status(500).json({ message: "FILES NOT RECEIVED" });
    }

    if (req.files.length === 0) {
      return res.status(400).json({ message: "NO FILES" });
    }

    const product = new Product({
      name,
      price: parseFloat(price),
      description,
      stock: parseInt(stock) || 0,
      sizes: sizes ? JSON.parse(sizes) : ['S', 'M', 'L', 'XL'],
      images: req.files.map(f => f.path)
    });

    await product.save();

    res.json(product);

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});


// ── UPDATE PRODUCT ─────────────────────────────────────────
router.put('/:id', auth, upload.array('images', 5), async (req, res) => {
  try {
    const updatedData = {
      ...req.body,
      sizes: JSON.parse(req.body.sizes || '[]')
    };

    if (req.files && req.files.length > 0) {
      updatedData.images = req.files.map(f => f.path);
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json(product);

  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});


// ── DELETE PRODUCT ─────────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json({ message: 'Product deleted successfully' });

  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;