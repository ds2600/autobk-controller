// api/v1/routes/reportRoutes.js

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken, checkRole } = require('../middleware/authMiddleware');


// , authenticateToken, checkRole('Basic')
router.get('/report', authenticateToken, async (req, res) => {
    reportController.getReport(req, res);
});

router.get('/reports', async (req, res) => {
    reportController.getReportFiles(req, res);
});

router.get('/reports/:file', async (req, res) => {
    reportController.getFileContents(req, res);
});

module.exports = router;