const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');

// CREATE an order (user)
router.post('/', async (req, res) => {
  try {
    const { user, products, totalAmount } = req.body;
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'No products provided' });
    }

    const newOrder = new Order({
      user: user,
      products: products,
      totalAmount: totalAmount,
      status: 'pending'
    });
    await newOrder.save();

    res.status(201).json({ message: 'Order created', order: newOrder });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET users orders
router.get('/:userId', async (req, res) => {
      const userOrders = await Order.find({ user: req.params.userId })
        .populate('products.product');
      return res.status(200).json(userOrders);
    }
);

// GET all users orders
router.get('/', async (req, res) => {
      const userOrders = await Order.find()
        .populate('products.product');
      return res.status(200).json(userOrders);
    }
);

// UPDATE order status (admin or relevant farmer)
router.put('/:orderId', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
      order.status = status;
      await order.save();
      return res.status(201).json({ message: 'Order status updated', order });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
