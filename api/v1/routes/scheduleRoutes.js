// api/v1/routes/scheduleRoutes.js

const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { authenticateToken, checkRole } = require('../middleware/authMiddleware');

router.get('/schedules', authenticateToken, checkRole('Basic'), async (req, res) => {
    try {
        const schedules = await scheduleController.getAllSchedules();
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/schedules/:deviceId', authenticateToken, checkRole('Basic'), async (req, res) => {
    try {
        const deviceId = req.params.deviceId;
        const schedule = await scheduleController.getScheduledBackups(deviceId);
        res.json(schedule);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/schedules/:deviceId', authenticateToken, async (req, res) => {
    try {
        const deviceId = req.params.deviceId;
        const scheduledTime = req.body ? req.body.scheduledTime : new Date();
        const result = await scheduleController.scheduleBackup(deviceId, scheduledTime);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/unschedule', authenticateToken, checkRole('Basic'), async (req, res) => { });

module.exports = router;