const express = require('express');
const router = express.Router();

const Product = require('../models/Product');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product); // IMPORTANT: direct object

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

router.delete('/:id', auth, async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  res.json({ message: 'Product deleted successfully' });
});

router.put('/:id', auth, upload.array('images', 5), async (req, res) => {
  try {
    const updatedData = {
      ...req.body,
      sizes: JSON.parse(req.body.sizes || "[]")
    };

    if (req.files && req.files.length > 0) {
      updatedData.images = req.files.map(file => file.path);
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    res.json(product);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const product = new Product({
      ...req.body,
      sizes: JSON.parse(req.body.sizes || "[]"),
      images: req.files?.map(file => file.path) || []
    });

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
