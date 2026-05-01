// ============================================================
//  routes/paymentRoutes.js — Razorpay Integration
// ============================================================

const express  = require('express');
const router   = express.Router();
const Razorpay = require('razorpay');
const crypto   = require('crypto');
const Order    = require('../models/Order');
const auth     = require('../middleware/authMiddleware');

// Initialize Razorpay with your keys from .env
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ── POST /payment/create-order
// Called when customer clicks "Pay Online" at checkout
// Creates a Razorpay order and returns the order ID to frontend
router.post('/create-order', async (req, res) => {
  try {
    const { amount } = req.body; // amount in rupees e.g. 599

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Razorpay requires amount in paise (1 rupee = 100 paise)
    const options = {
      amount:   Math.round(amount * 100),
      currency: 'INR',
      receipt:  `receipt_${Date.now()}`
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.json({
      success:        true,
      razorpayOrderId: razorpayOrder.id,
      amount:          razorpayOrder.amount,
      currency:        razorpayOrder.currency,
      keyId:           process.env.RAZORPAY_KEY_ID // sent to frontend to initialize widget
    });
  } catch (err) {
    console.error('Razorpay create order error:', err);
    res.status(500).json({ message: 'Payment initialization failed' });
  }
});

// ── POST /payment/verify
// Called after customer completes payment in Razorpay widget
// Verifies the payment signature to confirm it's genuine
// Then saves the order to MongoDB
router.post('/verify', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      // Order details
      customerName,
      phone,
      address,
      items,
      totalPrice,
      orderNote
    } = req.body;

    // ── Signature verification ──────────────────────────────
    // Razorpay signs the payment with your secret key.
    // We recreate the signature and compare — if they match, payment is real.
    const body      = razorpay_order_id + '|' + razorpay_payment_id;
    const expected  = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed. Invalid signature.' });
    }

    // ── Payment is genuine — save order to DB ───────────────
    const order = new Order({
      customerName,
      phone,
      address,
      items,
      totalPrice,
      orderNote:      orderNote || '',
      status:         'confirmed', // online payments go straight to confirmed
      paymentMethod:  'Online Payment',
      paymentId:      razorpay_payment_id,
      razorpayOrderId: razorpay_order_id
    });

    await order.save();

    res.json({
      success: true,
      message: 'Payment successful! Order confirmed.',
      order: {
        _id:         order._id,
        status:      order.status,
        totalPrice:  order.totalPrice,
        paymentId:   order.paymentId
      }
    });
  } catch (err) {
    console.error('Payment verify error:', err);
    res.status(500).json({ message: 'Order saving failed after payment' });
  }
});

module.exports = router;
