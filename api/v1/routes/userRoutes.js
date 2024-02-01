// api/v1/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../models');
const { authenticateToken, checkRole } = require('../middleware/authMiddleware');
const { generateUniqueToken, sendPasswordResetEmail, validateResetToken } = require('../../../utilities/emailUtils');
const logConfig = require('../../../config/logConfig.js')
const logger = logConfig.defaultLogger;

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userController.login(email, password);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/register', authenticateToken, checkRole('Administrator'), async (req, res) => {
    try {
        const { email, password, userLevel } = req.body;
        const result = await userController.register(email, password, userLevel);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/user/update-settings/:userId', authenticateToken, async (req, res) => {
    try {
        const userIdToUpdate = parseInt(req.params.userId);
        const loggedInUserId = req.user.userId;
        const loggedInUserRole = req.user.userLevel;
        const result = await userController.updateSettings(userIdToUpdate, req.body, loggedInUserId, loggedInUserRole);
        res.status(200).json(result);
    } catch (error) {
        logger.error('Error updating user settings: ' + error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/user/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.userId;

        const result = await userController.changePassword(currentPassword, newPassword, userId);

        res.status(200).json(result);
    } catch (error) {
        logger.error('Error changing password: ' + error);
        res.status(500).json({ error: error.message });
    }
});

router.delete('/user/:userId', authenticateToken, checkRole('Administrator'), async (req, res) => {
    try {
        const userIdToDelete = parseInt(req.params.userId);
        const loggedInUser = req.user.userId;

        await userController.deleteUser(userIdToDelete, loggedInUser);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        logger.error('Error deleting user: ' + error);
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
        
        userToUpdate.loginAttempts = 0;
        userToUpdate.isLocked = false;
        await userToUpdate.save();

        res.status(200).json({ message: 'User account unlocked successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;