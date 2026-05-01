// ============================================================
//  routes/settingsRoutes.js — Store settings API
// ============================================================

const express  = require('express');
const router   = express.Router();
const Settings = require('../models/Settings');
const auth     = require('../middleware/authMiddleware');

// ── GET /settings — Public (checkout needs to know if COD is on)
router.get('/', async (req, res) => {
  try {
    // Find or create the single settings document
    let settings = await Settings.findOne({ key: 'store' });
    if (!settings) {
      settings = await Settings.create({ key: 'store' });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /settings — Admin only (update any setting)
router.put('/', auth, async (req, res) => {
  try {
    const { codEnabled, onlinePaymentEnabled, storeName } = req.body;

    let settings = await Settings.findOne({ key: 'store' });
    if (!settings) {
      settings = new Settings({ key: 'store' });
    }

    // Only update fields that were sent
    if (codEnabled !== undefined)           settings.codEnabled           = codEnabled;
    if (onlinePaymentEnabled !== undefined) settings.onlinePaymentEnabled = onlinePaymentEnabled;
    if (storeName !== undefined)            settings.storeName            = storeName;

    await settings.save();
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
