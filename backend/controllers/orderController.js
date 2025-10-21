const Order = require('../models/orderModel');
const User = require('../models/userModel');

// Middleware to authenticate user via x-user-id header
exports.authMiddleware = async (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ message: 'User ID required' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid user ID' });
    }
    req.userId = userId;
    next();
  } catch (error) {
    console.error('authMiddleware error:', error.message);
    res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
};

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    if (!req.body.cartItems || req.body.cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    if (!req.userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const order = new Order({
      orderNumber: Date.now(),
      cartItems: req.body.cartItems,
      amount: req.body.amount || '0',
      status: req.body.status || 'Pending',
      createdAt: req.body.createdAt ? new Date(req.body.createdAt) : new Date(),
      customerDetails: req.body.customerDetails || {},
      upiId: req.body.upiId || '',
      userId: req.userId
    });

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    console.error('createOrder error:', error.message);
    res.status(400).json({ message: 'Failed to create order', error: error.message });
  }
};

// Get all orders (admin)
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error('getOrders error:', error.message);
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

// Get orders for a specific user
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error('getUserOrders error:', error.message);
    res.status(500).json({ message: 'Failed to fetch user orders', error: error.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('updateOrderStatus error:', error.message);
    res.status(400).json({ message: 'Failed to update order status', error: error.message });
  }
};
