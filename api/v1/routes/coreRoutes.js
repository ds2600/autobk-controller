// api/v1/routes/coreRoutes.js

const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole } = require('../middleware/authMiddleware');
const { exec } = require('child_process');
const { createLogger } = require('../../../config/logConfig.js')
const logger = createLogger('core');

// , authenticateToken, checkRole('Basic')
router.get('/running', (req, res) => {
    exec(`ps -ax | grep -i ${process.env.REACT_APP_AUTOBK_SERVICE} | grep -v grep || true`, (error, stdout, stderr) => {
        if (error) {
            logger.error(`exec error: ${error}`);
            res.status(500).json({ error: 'An error occurred while checking the process' });
            return;
        }
    
        const pids = stdout.split('\n');
        pids.pop(); 
    
        let exst = false;
        if (pids.length > 0) {
            exst = true;
        }
    
        res.json({ running: exst });
    });
});

router.get('/server-time', (req, res) => {
    const date = new Date();
    const time = `${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}`;
    res.json({ time });
});

module.exports = router;