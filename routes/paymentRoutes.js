// ============================================================
//  routes/paymentRoutes.js — Razorpay Integration
// ============================================================

const express  = require('express');
const router   = express.Router();
const Razorpay = require('razorpay');
const crypto   = require('crypto');
const Order    = require('../models/Order');

// ── POST /payment/create-order
router.post('/create-order', async (req, res) => {
  try {
    // ✅ FIX: Initialize Razorpay INSIDE the route
    // This way it reads the env vars at request time, not at startup
    const razorpay = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const options = {
      amount:   Math.round(amount * 100), // paise
      currency: 'INR',
      receipt:  `receipt_${Date.now()}`
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.json({
      success:         true,
      razorpayOrderId: razorpayOrder.id,
      amount:          razorpayOrder.amount,
      currency:        razorpayOrder.currency,
      keyId:           process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    console.error('Razorpay create order error:', err);
    res.status(500).json({ message: 'Payment initialization failed: ' + err.message });
  }
});

// ── POST /payment/verify
router.post('/verify', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customerName,
      phone,
      address,
      items,
      totalPrice,
      orderNote
    } = req.body;

    // Verify signature
    const body     = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed.' });
    }

    // Save order
    const order = new Order({
      customerName,
      phone,
      address,
      items,
      totalPrice,
      orderNote:       orderNote || '',
      status:          'confirmed',
      paymentMethod:   'Online Payment',
      paymentStatus:   'paid',
      paymentId:       razorpay_payment_id,
      razorpayOrderId: razorpay_order_id
    });

    await order.save();

    res.json({
      success: true,
      message: 'Payment successful! Order confirmed.',
      order: {
        _id:        order._id,
        status:     order.status,
        totalPrice: order.totalPrice,
        paymentId:  order.paymentId
      }
    });
  } catch (err) {
    console.error('Payment verify error:', err);
    res.status(500).json({ message: 'Order saving failed: ' + err.message });
  }
});

module.exports = router;
