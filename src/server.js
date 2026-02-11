require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN;

// Middleware
app.use(cors({
    origin: CLIENT_ORIGIN || true,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const csrfProtection = csrf({
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    }
});

// Database Connection
mongoose.set('bufferCommands', false);

// Routes
app.use((req, res, next) => {
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') return next();
    return csrfProtection(req, res, next);
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/bookings', require('./routes/booking'));
app.use('/api/orders', require('./routes/order'));

app.get('/api', (req, res) => {
    res.json({ message: 'Welcome to the Restaurant API' });
});

app.get('/api/csrf-token', csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({ message: 'Invalid CSRF token' });
    }
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message
    });
});

// Start Server only after DB is available.
async function start() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not set');
        }
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not set');
        }

        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000
        });
        console.log('Connected to MongoDB');

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err.message);
        process.exit(1);
    }
}

start();
