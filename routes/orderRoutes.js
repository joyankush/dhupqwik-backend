// ============================================================
//  routes/orderRoutes.js
// ============================================================

const express = require('express');
const router  = express.Router();
const Order   = require('../models/Order');
const Product = require('../models/Product');
const auth    = require('../middleware/authMiddleware');

// Place a new order (customer)
router.post('/', async (req, res) => {
  try {
    const { items, customerName, phone, address } = req.body;

    let totalPrice = 0;
    const enrichedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }
      enrichedItems.push({
        productId: item.productId,
        name:      product.name,
        price:     product.price,
        size:      item.size,
        quantity:  item.quantity,
        image:     product.images?.[0] || ''
      });
      totalPrice += product.price * item.quantity;
    }

    const order = new Order({
      customerName, phone, address,
      items: enrichedItems,
      totalPrice,
      status: 'pending'
    });

    await order.save();
    res.json({ order }); // wrap in object so frontend can do data.order
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ FIX: stats/summary MUST be before /:id — otherwise Express
// treats "stats" as an order ID and the route never matches
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const [total, pending, confirmed, outForDelivery, delivered, cancelled, revenue] =
      await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ status: 'pending' }),
        Order.countDocuments({ status: 'confirmed' }),
        Order.countDocuments({ status: 'out for delivery' }),
        Order.countDocuments({ status: 'delivered' }),
        Order.countDocuments({ status: 'cancelled' }),
        Order.aggregate([
          { $match: { status: 'delivered' } },
          { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ])
      ]);

    res.json({
      stats: {
        totalOrders: total,
        pending, confirmed, outForDelivery, delivered, cancelled,
        totalRevenue: revenue[0]?.total || 0
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ FIX: phone/:phone MUST be before /:id too
router.get('/phone/:phone', async (req, res) => {
  try {
    const orders = await Order.find({ phone: req.params.phone }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all orders — admin only
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update order status — admin only
router.put('/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['pending', 'confirmed', 'out for delivery', 'delivered', 'cancelled'];
    if (!valid.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, $push: { statusHistory: { status, changedAt: new Date() } } },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
