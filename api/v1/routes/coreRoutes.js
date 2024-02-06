// api/v1/routes/coreRoutes.js

const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole } = require('../middleware/authMiddleware');
const { exec } = require('child_process');
const { createLogger } = require('../../../config/logConfig.js')
const logger = createLogger('core');

// , authenticateToken, checkRole('Basic')
router.get('/running', (req, res) => {
    const prcs = 'autobkservice'; 
    exec(`ps -ax | grep -i ${prcs} | grep -v grep || true`, (error, stdout, stderr) => {
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

module.exports = router;