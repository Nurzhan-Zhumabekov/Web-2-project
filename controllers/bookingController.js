const Booking = require('../models/Booking');
const User = require('../models/User');
const sendEmail = require('../utils/email');

async function createBooking(req, res) {
    try {
        const newBooking = new Booking({
            ...req.body,
            user: req.user.id
        });
        await newBooking.save();

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

        return res.status(201).json(newBooking);
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
}

async function getBookings(req, res) {
    try {
        const filter = req.user.role === 'admin' ? {} : { user: req.user.id };
        const bookings = await Booking.find(filter).populate('user', 'username email');
        return res.json(bookings);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

async function getBookingById(req, res) {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (req.user.role !== 'admin' && booking.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        return res.json(booking);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

async function updateBooking(req, res) {
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
        return res.json(booking);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

async function deleteBooking(req, res) {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (req.user.role !== 'admin' && booking.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await Booking.findByIdAndDelete(req.params.id);
        return res.json({ message: 'Booking deleted' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports = {
    createBooking,
    getBookings,
    getBookingById,
    updateBooking,
    deleteBooking
};
