// api/v1/routes/deviceRoutes.js

const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const scheduleController = require('../controllers/scheduleController');
const { authenticateToken, checkRole } = require('../middleware/authMiddleware');
const appConfig = require('../../../config/appConfig');

router.get('/devices', authenticateToken, checkRole('Basic'), async (req, res) => {
    try {
        const devices = await deviceController.getDeviceList();
        res.json(devices);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/devices/:id', authenticateToken, checkRole('Basic'), async (req, res) => {
    try {
        const deviceId = req.params.id;
        const deviceInfo = await deviceController.getDeviceInfo(deviceId);
        const backups = await deviceController.getAllBackups(deviceId);
        const scheduledBackups = await scheduleController.getScheduledBackups(deviceId);
        
        res.json({
            deviceInfo,
            backups,
            scheduledBackups
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/device-types', async (req, res) => {
    try {
        res.json(appConfig.appConfig.deviceTypes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/devices/:id', authenticateToken, checkRole('Basic'), async (req, res) => {
    try {
        const deviceId = req.params.id;
        const deviceData = req.body;
        const device = await deviceController.updateDevice(deviceId, deviceData);
        res.json(device);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/devices', authenticateToken, checkRole('Basic'), async (req, res) => {
    try {
        const newDeviceData = req.body; 
        const newDevice = await deviceController.addDevice(newDeviceData);
        res.status(201).json(newDevice);
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});

router.delete('/devices/:id', authenticateToken, checkRole('User'), async (req, res) => {
    try {
        const deviceId = req.params.id;
        await deviceController.deleteDevice(deviceId);
        res.status(200).send({ message: 'Device and all associated data deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;