// ============================================================
//  routes/couponRoutes.js
// ============================================================

const express = require('express');
const router  = express.Router();
const Coupon  = require('../models/Coupon');
const auth    = require('../middleware/authMiddleware');

// ── POST /coupons/apply — Public (customer applies a code)
router.post('/apply', async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    if (!code) return res.status(400).json({ message: 'Please enter a coupon code.' });

    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });

    // Not found
    if (!coupon) return res.status(404).json({ message: 'Invalid coupon code.' });

    // Inactive
    if (!coupon.isActive) return res.status(400).json({ message: 'This coupon is no longer active.' });

    // Expired
    if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({ message: 'This coupon has expired.' });
    }

    // Usage limit reached
    if (coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ message: 'This coupon has reached its usage limit.' });
    }

    // Minimum order check
    if (cartTotal < coupon.minOrder) {
      return res.status(400).json({
        message: `Minimum order of ₹${coupon.minOrder.toLocaleString('en-IN')} required for this coupon.`
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.type === 'percent') {
      discount = Math.round((cartTotal * coupon.value) / 100);
    } else {
      discount = coupon.value;
    }

    // Don't discount more than cart total
    discount = Math.min(discount, cartTotal);

    res.json({
      success:      true,
      code:         coupon.code,
      type:         coupon.type,
      value:        coupon.value,
      discount,
      finalTotal:   cartTotal - discount,
      message:      `Coupon applied! You save ₹${discount.toLocaleString('en-IN')}`
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /coupons — Admin: get all coupons
router.get('/', auth, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /coupons — Admin: create a coupon
router.post('/', auth, async (req, res) => {
  try {
    const { code, type, value, minOrder, maxUses, expiryDate } = req.body;

    if (!code || !value) {
      return res.status(400).json({ message: 'Code and value are required.' });
    }

    // Check if code already exists
    const existing = await Coupon.findOne({ code: code.trim().toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: 'A coupon with this code already exists.' });
    }

    const coupon = new Coupon({
      code:       code.trim().toUpperCase(),
      type:       type || 'percent',
      value:      Number(value),
      minOrder:   Number(minOrder) || 0,
      maxUses:    Number(maxUses) || 100,
      expiryDate: expiryDate || null
    });

    await coupon.save();
    res.json({ success: true, coupon });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /coupons/:id — Admin: toggle active / edit
router.put('/:id', auth, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!coupon) return res.status(404).json({ message: 'Coupon not found.' });
    res.json({ success: true, coupon });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /coupons/:id — Admin: delete a coupon
router.delete('/:id', auth, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found.' });
    res.json({ success: true, message: 'Coupon deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
