const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    guests: { type: Number, required: true },
    tableNumber: { type: Number },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
    specialRequests: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
