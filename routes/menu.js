const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const menuController = require('../controllers/menuController');

// Get all menu items
router.get('/', menuController.getMenu);

// Admin: get all menu items
router.get('/admin', auth, role(['admin']), menuController.getMenuAdmin);

// Add menu item (Admin only)
router.post('/', auth, role(['admin']), menuController.createMenuItem);

// Update menu item (Admin only)
router.put('/:id', auth, role(['admin']), menuController.updateMenuItem);

// Delete menu item (Admin only)
router.delete('/:id', auth, role(['admin']), menuController.deleteMenuItem);


module.exports = router;
