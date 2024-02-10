// api/v1/routes/backupRoutes.jss

const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backupController');
const { authenticateToken, checkRole } = require('../middleware/authMiddleware');
const { createLogger } = require('../../../config/logConfig.js')
const logger = createLogger('backupRouter');

// , authenticateToken, checkRole('Basic')
router.get('/download/:fileId', authenticateToken, async (req, res) => {
    try {
        const fileId = req.params.fileId;
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
        await backupController.downloadBackup(fileId, res);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;