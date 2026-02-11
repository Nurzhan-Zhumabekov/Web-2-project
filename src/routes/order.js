const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const orderController = require('../controllers/orderController');

// Place an order
router.post('/', auth, orderController.createOrder);

// Get user's orders
router.get('/my-orders', auth, orderController.getMyOrders);

// Admin: get all orders
router.get('/', auth, role(['admin']), orderController.getAllOrders);

// Get specific order (Admin or owner)
router.get('/:id', auth, orderController.getOrderById);

// Admin: update order status
router.put('/:id', auth, role(['admin']), orderController.updateOrderStatus);

// Admin: delete order
router.delete('/:id', auth, role(['admin']), orderController.deleteOrder);

module.exports = router;
