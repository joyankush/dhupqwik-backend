// ============================================================
//  routes/bannerRoutes.js
// ============================================================
const express = require('express');
const router  = express.Router();
const Banner  = require('../models/Banner');
const auth    = require('../middleware/authMiddleware');
const upload  = require('../middleware/uploadMiddleware');

// ── GET /banners — Public (frontend fetches active banners)
router.get('/', async (req, res) => {
  try {
    // isActive: true OR isActive not set (older docs)
    const banners = await Banner.find({ isActive: { $ne: false } }).sort({ order: 1, createdAt: 1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /banners/all — Admin (all banners including inactive)
router.get('/all', auth, async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1, createdAt: 1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /banners — Admin: create banner (with optional image)
router.post('/', auth, upload.single('bgImage'), async (req, res) => {
  try {
    const { title, subtitle, tag, btnText, bgColor, textColor, accentColor, linkType, productId, customUrl, order } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required.' });

    const banner = new Banner({
      title, subtitle, tag, btnText, bgColor, textColor, accentColor,
      linkType, productId, customUrl,
      order:   Number(order) || 0,
      bgImage: req.file ? req.file.path : ''
    });

    await banner.save();
    res.json({ success: true, banner });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /banners/:id — Admin: update banner
router.put('/:id', auth, upload.single('bgImage'), async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) updates.bgImage = req.file.path;
    if (updates.isActive !== undefined) updates.isActive = updates.isActive === 'true' || updates.isActive === true;

    const banner = await Banner.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!banner) return res.status(404).json({ message: 'Banner not found.' });
    res.json({ success: true, banner });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /banners/:id — Admin: delete banner
router.delete('/:id', auth, async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Banner not found.' });
    res.json({ success: true, message: 'Banner deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
