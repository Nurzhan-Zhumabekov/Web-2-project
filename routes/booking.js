const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const validate = require('../middleware/validate');
const Joi = require('joi');
const sendEmail = require('../utils/email');
const User = require('../models/User');

const bookingSchema = Joi.object({
    date: Joi.date().required(),
    time: Joi.string().required(),
    guests: Joi.number().min(1).max(20).required(),
    tableNumber: Joi.number(),
    specialRequests: Joi.string().allow(''),
    status: Joi.string().valid('pending', 'confirmed', 'cancelled')
});

// Create a booking
router.post('/', auth, validate(bookingSchema), async (req, res) => {
    try {
        const newBooking = new Booking({
            ...req.body,
            user: req.user.id
        });
        await newBooking.save();

        // Send Confirmation Email
        try {
            const user = await User.findById(req.user.id);
            await sendEmail({
                email: user.email,
                subject: 'Booking Confirmation',
                message: `Your booking for ${newBooking.date} at ${newBooking.time} is confirmed.`,
                html: `<h1>Booking Confirmed</h1><p>Your booking for <b>${newBooking.date.toDateString()}</b> at <b>${newBooking.time}</b> is confirmed.</p>`
            });
        } catch (emailErr) {
            console.error('Email could not be sent', emailErr);
        }

        res.status(201).json(newBooking);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get all bookings (Admin sees all, User sees theirs)
router.get('/', auth, async (req, res) => {
    try {
        const filter = req.user.role === 'admin' ? {} : { user: req.user.id };
        const bookings = await Booking.find(filter).populate('user', 'username email');
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get specific booking
router.get('/:id', auth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (req.user.role !== 'admin' && booking.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        res.json(booking);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update booking
router.put('/:id', auth, validate(bookingSchema), async (req, res) => {
    try {
        let booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (req.user.role !== 'admin' && booking.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (req.body.status && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to change status' });
        }

        booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(booking);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete booking
router.delete('/:id', auth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (req.user.role !== 'admin' && booking.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await Booking.findByIdAndDelete(req.params.id);
        res.json({ message: 'Booking deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
