const express = require('express');
const {
  createOrder,
  getOrders,
  getUserOrders,
  updateOrderStatus,
  authMiddleware
} = require('../controllers/orderController');

const router = express.Router();

// Log route registration
console.log('[Routes] Order routes registered');

// POST /api/orders - Create new order
router.post('/', authMiddleware, createOrder);

// GET /api/orders - Get all orders (Admin)
router.get('/', getOrders);

// GET /api/orders/user - Get orders for logged-in user
router.get('/user', authMiddleware, getUserOrders);

// PUT /api/orders/:id/status - Update order status
// router.put('/:id/status', updateOrderStatus);
router.put('/:id', updateOrderStatus);

module.exports = router;
