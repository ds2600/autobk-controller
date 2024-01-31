// api/v1/routes/userRoutes.js

const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../models');
const { authenticateToken, checkRole } = require('../middleware/authMiddleware');
const { generateUniqueToken, sendPasswordResetEmail, validateResetToken } = require('../../../utilities/emailUtils');

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await db.User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (user.isLocked) {
            return res.status(403).json({ error: 'Account locked' });
        }

        if (bcrypt.compareSync(password, user.passwordHash)) {
            user.loginAttempts = 0;
            await user.save();

            const token = jwt.sign({ userId: user.kSelf, userLevel: user.userLevel }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ token, userLevel: user.userLevel });
        } else {
            user.loginAttempts++;

            if (user.loginAttempts >= process.env.LOGIN_ATTEMPTS_THRESHOLD) {
                user.isLocked = true;
            }

            await user.save();

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

router.put('/user/update-settings/:userId', authenticateToken, async (req, res) => {
    try {
        const userIdToUpdate = parseInt(req.params.userId);
        const loggedInUserId = req.user.userId;
        const loggedInUserRole = req.user.userLevel;

        // Allow user to update their own settings or allow Administrator to update any user's settings
        if (loggedInUserId !== userIdToUpdate && loggedInUserRole !== 'Administrator') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const userUpdates = req.body;

        // Find the user by ID
        const user = await db.User.findByPk(userIdToUpdate);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update allowed fields, with special rules for certain fields
        Object.keys(userUpdates).forEach(key => {
            if (key === 'kSelf') {
                // Skip updating kSelf
            } else if (key === 'userLevel' && loggedInUserRole !== 'Administrator') {
                // Only allow Administrators to update userLevel
            } else if (key === 'passwordHash') {
                // Skip updating passwordHash directly, handle through a separate endpoint
            } else if (key in user) {
                user[key] = userUpdates[key];
            }
        });

        await user.save();

        res.status(200).json({ message: 'User settings updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/user/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.userId;

        const user = await db.User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        if (!bcrypt.compareSync(currentPassword, user.passwordHash)) {
            return res.status(401).json({ error: 'Incorrect password' });
        }

        // Update with new hashed password
        user.passwordHash = bcrypt.hashSync(newPassword, 10);
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

router.delete('/user/:userId', authenticateToken, checkRole('Administrator'), async (req, res) => {
    try {
        const userIdToDelete = parseInt(req.params.userId);

        // Check if the user trying to delete is not deleting their own account
        if (req.user.userId === userIdToDelete) {
            return res.status(400).json({ error: "Cannot delete own user account" });
        }

        const result = await db.User.destroy({
            where: { kSelf: userIdToDelete }
        });

        if (result === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/user/:userId', authenticateToken, async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const user = await db.User.findByPk(userId, {
            attributes: { exclude: ['passwordHash'] } 
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/users', authenticateToken, checkRole('Administrator'), async (req, res) => {
    try {
        const users = await db.User.findAll({
            attributes: { exclude: ['passwordHash'] } 
        });

        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/user/reset-password-request', async (req, res) => {
    try {
        const { email } = req.body;

        // Check if the user with the provided email exists
        const user = await db.User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate a unique reset token 
        const resetToken = generateUniqueToken();

        // Store the reset token and its expiration date in the database
        user.resetToken = resetToken;
        user.resetTokenExpiresAt = new Date(new Date().getTime() + 3600000); // Token expires in 1 hour
        await user.save();

        // Send an email to the user with a link containing the resetToken
        sendPasswordResetEmail(email, resetToken); // Implement this function to send the email

        res.status(200).json({ message: 'Password reset email sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/user/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        const isValidToken = validateResetToken(token);

        // Validate token
        if (!isValidToken) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        // Find the user by the reset token
        const user = await db.User.findOne({ where: { resetToken: token } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.passwordhash = bcrypt.hashSync(newPassword, 10);
        user.resetToken = null;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/user/unlock/:userId', authenticateToken, checkRole('Administrator'), async (req, res) => {
    try {
        const userIdToUnlock = parseInt(req.params.userId);
        const userToUpdate = await db.User.findByPk(userIdToUnlock);

        if (!userToUpdate) {
            return res.status(404).json({ error: 'User not found' });
        }

        userToUpdate.isLocked = false;
        await userToUpdate.save();

        res.status(200).json({ message: 'User account unlocked successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;