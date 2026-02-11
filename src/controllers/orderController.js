const Order = require('../models/Order');

async function createOrder(req, res) {
    try {
        const newOrder = new Order({
            ...req.body,
            user: req.user.id
        });
        await newOrder.save();
        return res.status(201).json(newOrder);
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
}

async function getMyOrders(req, res) {
    try {
        const orders = await Order.find({ user: req.user.id }).populate('items.menuItem');
        return res.json(orders);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

async function getAllOrders(req, res) {
    try {
        const orders = await Order.find().populate('items.menuItem').populate('user', 'username email');
        return res.json(orders);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

async function getOrderById(req, res) {
    try {
        const order = await Order.findById(req.params.id).populate('items.menuItem').populate('user', 'username email');
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (req.user.role !== 'admin' && order.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        return res.json(order);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

async function updateOrderStatus(req, res) {
    try {
        const { status } = req.body;
        const allowed = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (status && !allowed.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const updated = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!updated) return res.status(404).json({ message: 'Order not found' });
        return res.json(updated);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

async function deleteOrder(req, res) {
    try {
        const deleted = await Order.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Order not found' });
        return res.json({ message: 'Order deleted' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports = {
    createOrder,
    getMyOrders,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder
};
