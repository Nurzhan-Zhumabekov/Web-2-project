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

async function seedMenu(req, res) {
    try {
        const existingItems = await MenuItem.countDocuments();
        if (existingItems > 0) {
            return res.json({ message: 'Menu already has items', count: existingItems });
        }

        const sampleItems = [
            {
                name: 'Bruschetta Classica',
                description: 'Toasted bread topped with fresh tomatoes, basil, and garlic',
                price: 12,
                category: 'Appetizer',
                image: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=500',
                isAvailable: true
            },
            {
                name: 'Caesar Salad',
                description: 'Crisp romaine lettuce with parmesan and homemade dressing',
                price: 14,
                category: 'Appetizer',
                image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500',
                isAvailable: true
            },
            {
                name: 'Grilled Salmon',
                description: 'Fresh Atlantic salmon with lemon butter sauce and vegetables',
                price: 32,
                category: 'Main Course',
                image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500',
                isAvailable: true
            },
            {
                name: 'Beef Tenderloin',
                description: 'Prime beef tenderloin with red wine reduction and truffle mash',
                price: 45,
                category: 'Main Course',
                image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=500',
                isAvailable: true
            },
            {
                name: 'Mushroom Risotto',
                description: 'Creamy arborio rice with wild mushrooms and parmesan',
                price: 24,
                category: 'Main Course',
                image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=500',
                isAvailable: true
            },
            {
                name: 'Tiramisu',
                description: 'Classic Italian dessert with mascarpone and espresso',
                price: 10,
                category: 'Dessert',
                image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500',
                isAvailable: true
            },
            {
                name: 'Chocolate Lava Cake',
                description: 'Warm chocolate cake with molten center and vanilla ice cream',
                price: 12,
                category: 'Dessert',
                image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=500',
                isAvailable: true
            },
            {
                name: 'Fresh Lemonade',
                description: 'House-made lemonade with fresh mint',
                price: 6,
                category: 'Beverage',
                image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=500',
                isAvailable: true
            }
        ];

        await MenuItem.insertMany(sampleItems);
        return res.json({ message: 'Menu seeded successfully', count: sampleItems.length });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports = {
    getMenu,
    getMenuAdmin,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    seedMenu
};
