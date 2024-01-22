// api/v1/routes/userRoutes.js

const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../models');
const { authenticateToken, checkRole } = require('../middleware/authMiddleware');

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await db.User.findOne({ where: { email } });
        if (user && bcrypt.compareSync(password, user.passwordHash)) {
            const token = jwt.sign({ userId: user.kSelf, userLevel: user.userLevel }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ token, userLevel: user.userLevel });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/register', authenticateToken, checkRole('Administrator'), async (req, res) => {
    try {
        const { email, password, isDailyReportEnabled, userLevel } = req.body;

        // hash password
        const passwordHash = bcrypt.hashSync(password, 10);

        // Create user
        const newUser = await db.User.create({
            email,
            passwordHash,
            isDailyReportEnabled,
            userLevel
        });

        res.status(201).json({ message: "User created successfully", userId: newUser.kSelf });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;