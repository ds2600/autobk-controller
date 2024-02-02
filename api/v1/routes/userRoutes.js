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
        const user = await userController.getUser(userId);
        res.status(200).json(user);
    } catch (error) {
        logger.error('Error getting user: ' + error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/users', authenticateToken, checkRole('Administrator'), async (req, res) => {
    try {
        const users = await userController.getUsers();
        res.status(200).json(users);
    } catch (error) {
        logger.error('Error getting users: ' + error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/user/reset-password-request', async (req, res) => {
    try {
        const { email } = req.body;
        const request = await userController.requestPasswordReset(email);
        res.status(200).json(request);
    } catch (error) {
        logger.error('Error requesting password reset: ' + error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/user/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        const request = await userController.resetPassword(token, newPassword);
        res.status(200).json(request);
    } catch (error) {
        logger.error('Error resetting password: ' + error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/user/unlock/:userId', authenticateToken, checkRole('Administrator'), async (req, res) => {
    try {
        const userIdToUnlock = parseInt(req.params.userId);
        const request = await userController.unlockUser(userIdToUnlock);
        res.status(200).json(request);
    } catch (error) {
        logger.error('Error unlocking user: ' + error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;