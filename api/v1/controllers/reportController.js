// api/v1/controllers/reportController.js

const { Backup, Schedule, Device } = require('../models');
const fs = require('fs');
const path = require('path');
const { createLogger } = require('../../../config/logConfig.js');
const { Op } = require('sequelize');
const logger = createLogger('reportController');
const moment = require('moment-timezone');

const reportController = {
  getReportFiles: async function(req, res) {
    try {
      const dir = process.env.REACT_APP_AUTOBK_REPORTS_DIR;
      const fileNames = fs.readdirSync(dir);

      const fileDetails = fileNames.map(file => {
        const stats = fs.statSync(path.join(dir, file));
        return {
          name: file,
          mtime: stats.mtime
        };
      });

      fileDetails.sort((a, b) => b.mtime - a.mtime);
      res.json(fileDetails);
    } catch (error) {
      logger.error(error);
      res.status(500).send('An error occurred while reading the reports directory');
    }
  },

  getFileContents: async function(req, res) {
    try {
      const fileName = req.params.file;
      const dir = process.env.REACT_APP_AUTOBK_REPORTS_DIR;
      const filePath = path.join(dir, fileName);

      if (!fs.existsSync(filePath)) {
        return res.status(404).send('File not found');
      }

      const fileContents = fs.readFileSync(filePath, 'utf8');
      res.send(fileContents);
    } catch (error) {
      logger.error(error);
      res.status(500).send('An error occurred while reading the file');
    }
  },

  generateRandomString: function(length) {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  },

  generateDailyReport: async function (start, end) {
    // Query fro completed backups
    const completedBackups = await Backup.findAll({
      where: {
        tComplete: {
          [Op.between]: [new Date(start), new Date(end)]
        }
      },
      order: [['tComplete', 'ASC']],
      include: [{
        model: Device,
        as: 'device',
        attributes: ['sName']
      }]
    });

    // Query for failed backups
    const failedSchedules = await Schedule.findAll({
      where: {
        tTime: {
          [Op.between]: [new Date(start), new Date(end)]
        },
        sState: 'Fail'
      },
      order: [['tTime', 'ASC']],
      include: [{
        model: Device,
        as: 'device',
        attributes: ['sName']
      }]
    });

    // Generate the report
    let report = '# AutoBk Daily Report\n\n';

    // Add the start and end date/time
    report += `**Period**: ${start} to ${end}\n\n`;

    report += '## Completed Backups\n';

    if (completedBackups.length === 0) {
      report += '**No backups completed during this period.**\n';
     
    } else {
      completedBackups.forEach(backup => {
        report += `- **Device**: ${backup.device.sName ? backup.device.sName : 'N/A'}\n`;
        report += `  - **File**: ${backup.sFile ? backup.sFile : 'N/A'}\n`;
        report += `    - **Completed**: ${backup.tComplete ? backup.tComplete : 'N/A'}\n`;
        report += `    - **Expires**: ${backup.tExpires ? backup.tExpires : 'N/A'}\n`;
        report += `    - **Comment**: ${backup.sComment ? backup.sComment : 'N/A'}\n`;
      });
    }
    
    report += '\n## Failed Backups\n';

    if (failedSchedules.length === 0) {
      report += '**No failed backups during this period**\n';
    } else {
      failedSchedules.forEach(schedule => {
        report += `- **Device**: ${schedule.device.sName ? schedule.device.sName : 'N/A'}\n`;
        report += `  - **Time**: ${schedule.tTime ? schedule.tTime : 'N/A'}\n`;
        report += `    - **Reason**: ${schedule.sComment ? schedule.sComment : 'N/A'}\n`;
      });
    }

    return report;
  },

  getReport: async function(req, res) {
    try {
      const start = req.query.start;
      const end = req.query.end;

      
      const filename = `report_${start}_${end}.md`;
      const dir = process.env.REACT_APP_AUTOBK_REPORTS_DIR;
      let filePath = path.join(dir, filename);

      // Ensure the directory exists
      if (!fs.existsSync(dir)){
        logger.info('Creating reports directory', dir);
        fs.mkdirSync(dir, { recursive: true });
      }

      // Validate the dates
      if (!start || !end) {
        return res.status(400).send('Start and end dates are required');
      }
      
      logger.info(`Report requested for ${start} to ${end}`);

      // Check if a report for these dates already exists
      if (fs.existsSync(filePath)) {
        // If the report exists, read and return it
        logger.info(`Report already exists at ${filePath}`);
        return res.json({ status: 'Report already exists', filePath})
      }

      // If the report doesn't exist, generate it
      const report = await this.generateDailyReport(start, end);

      // Save report
      fs.writeFileSync(filePath, report);
      logger.info(`Report saved to ${filePath}`);

      return res.json({status: 'Report generated', filePath})
    } catch (error) {
      logger.error(error);
      res.status(500).send('An error occurred while generating the report')
    }
  }

};

module.exports = reportController;