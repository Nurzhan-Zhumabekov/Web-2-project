const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/email');

const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 1000
};

async function register(req, res) {
    try {
        const { username, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });
        user = new User({ username, email, password });
        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, cookieOptions);

        try {
            await sendEmail({
                email: user.email,
                subject: 'Registratsiya uspeshno zavershena',
                message: `Здравствуйте, ${user.username}! Регистрация выполнена успешно.`,
                html: `<h1>Регистрация прошла успешно</h1><p>Здравствуйте, ${user.username}! Ваш аккаунт в Restaurant App успешно создан.</p>`
            });
        } catch (emailErr) {
            console.error('Email could not be sent', emailErr);
        }

        return res.status(201).json({ token, user: { id: user._id, username, email, role: user.role } });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, cookieOptions);
        return res.json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role } });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

async function getProfile(req, res) {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        return res.json(user);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

async function updateProfile(req, res) {
    try {
        const { username, email } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        if (username) user.username = username;
        if (email) user.email = email;

        await user.save();
        return res.json({ message: 'Profile updated successfully', user: { id: user._id, username: user.username, email: user.email, role: user.role } });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

function logout(req, res) {
    res.clearCookie('token', {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    });
    return res.json({ message: 'Logged out' });
}

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    logout
};
