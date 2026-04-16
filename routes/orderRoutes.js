const Product = require('../models/Product');
const express = require('express');
const router = express.Router();

const Order = require('../models/Order');
const auth = require('../middleware/authMiddleware');

// Place a new order (customer)

// Place a new order (customer)



router.post('/', async (req, res) => {
  try {
    const { items, customerName, phone, address } = req.body;

    let totalPrice = 0;
    const enrichedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      enrichedItems.push({
        productId: item.productId,
        name: product.name,
        price: product.price,
        size: item.size,
        quantity: item.quantity
      });

      totalPrice += product.price * item.quantity;
    }

    const order = new Order({
      customerName: customerName,
      phone,
      address,
      items: enrichedItems,
      totalPrice,
      status: 'pending'
    });

    await order.save();

    res.json(order);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Get all orders (admin only)
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ FIX 3: Get orders by phone number (customer "My Orders" page)
// This was completely missing — without it customers can't see their orders
router.get('/phone/:phone', async (req, res) => {
  try {
    const orders = await Order.find({ phone: req.params.phone }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ FIX 3: Update order status (admin only)
// This was completely missing — without it admin can't change pending → confirmed etc.
router.put('/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'out for delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status,
        $push: { statusHistory: { status, changedAt: new Date() } }
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
