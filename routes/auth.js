const express = require('express');
const User = require('../models/User');
const router = express.Router();

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = new User(username, email, password);
        await user.setPassword();
        await user.save();

        res.status(201).json({ message: 'User registered successfully', userId: user.userId });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const userData = await User.findByEmail(email);
        if (!userData) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const user = new User(userData.username, userData.email, userData.password);
        const isPasswordValid = await user.checkPassword(password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        req.session.userId = userData.userId;
        req.session.username = userData.username;

        console.log('Session Data after login:', req.session);

        res.status(200).json({ message: 'Login successful', user: { username: req.session.username } });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error logging out:', err);
            res.status(500).json({ message: 'Error logging out', error: err.message });
        } else {
            res.status(200).json({ message: 'Logout successful' });
        }
    });
});

router.get('/current', (req, res) => {
    if (req.session.userId) {
        res.json({ userId: req.session.userId, username: req.session.username });
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
});

module.exports = router; 