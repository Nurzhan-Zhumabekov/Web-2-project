const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Place an order
router.post('/', auth, async (req, res) => {
    try {
        const newOrder = new Order({
            ...req.body,
            user: req.user.id
        });
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get user's orders
router.get('/my-orders', auth, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).populate('items.menuItem');
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Admin: get all orders
router.get('/', auth, role(['admin']), async (req, res) => {
    try {
        const orders = await Order.find().populate('items.menuItem').populate('user', 'username email');
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get specific order (Admin or owner)
router.get('/:id', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('items.menuItem').populate('user', 'username email');
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (req.user.role !== 'admin' && order.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Admin: update order status
router.put('/:id', auth, role(['admin']), async (req, res) => {
    try {
        const { status } = req.body;
        const allowed = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (status && !allowed.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const updated = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!updated) return res.status(404).json({ message: 'Order not found' });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Admin: delete order
router.delete('/:id', auth, role(['admin']), async (req, res) => {
    try {
        const deleted = await Order.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Order not found' });
        res.json({ message: 'Order deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
