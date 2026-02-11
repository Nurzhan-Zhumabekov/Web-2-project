const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
        quantity: { type: Number, required: true, default: 1 }
    }],
    totalAmount: { type: Number, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
    paymentMethod: { type: String, enum: ['cash', 'card'], default: 'cash' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
