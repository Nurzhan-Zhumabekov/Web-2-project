const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const validate = require('../middleware/validate');
const Joi = require('joi');
const bookingController = require('../controllers/bookingController');

const bookingSchema = Joi.object({
    date: Joi.date().required(),
    time: Joi.string().required(),
    guests: Joi.number().min(1).max(20).required(),
    tableNumber: Joi.number(),
    specialRequests: Joi.string().allow(''),
    status: Joi.string().valid('pending', 'confirmed', 'cancelled')
});

// Create a booking
router.post('/', auth, validate(bookingSchema), bookingController.createBooking);

// Get all bookings (Admin sees all, User sees theirs)
router.get('/', auth, bookingController.getBookings);

// Get specific booking
router.get('/:id', auth, bookingController.getBookingById);

// Update booking
router.put('/:id', auth, validate(bookingSchema), bookingController.updateBooking);

// Delete booking
router.delete('/:id', auth, bookingController.deleteBooking);

module.exports = router;
