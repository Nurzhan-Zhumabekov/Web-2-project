const MenuItem = require('../models/MenuItem');

async function getMenu(req, res) {
    try {
        const items = await MenuItem.find({ isAvailable: true });
        return res.json(items);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

async function getMenuAdmin(req, res) {
    try {
        const items = await MenuItem.find();
        return res.json(items);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

async function createMenuItem(req, res) {
    try {
        const newItem = new MenuItem(req.body);
        await newItem.save();
        return res.status(201).json(newItem);
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
}

async function updateMenuItem(req, res) {
    try {
        const updated = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: 'Menu item not found' });
        return res.json(updated);
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
}

async function deleteMenuItem(req, res) {
    try {
        const deleted = await MenuItem.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Menu item not found' });
        return res.json({ message: 'Menu item deleted' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports = {
    getMenu,
    getMenuAdmin,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem
};
