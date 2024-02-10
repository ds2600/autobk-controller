// api/v1/controllers/backupController.jss

const { Backup } = require('../models');
const fs = require('fs');
const path = require('path');
const { createLogger } = require('../../../config/logConfig.js')
const logger = createLogger('backupController');

const backupController = {
    /**
     * Initiates a file download for a specific backup file.
     *
     * @param {number} fileId - The ID of the backup file to download.
     * @param {Object} res - The Express response object.
     * @throws {Error} Will throw an error if the backup file is not found.
     * @returns {Promise<void>} A promise that resolves when the file download has been initiated.
     */
    async downloadBackup(fileId, res) {
        try {
            const backup = await Backup.findByPk(fileId);

            if (!backup) {
                throw new Error('File not found');
            }
        
            const filePath = backup.sFile;
            const fileName = path.basename(filePath);
            logger.info(`Downloading backup ${fileId}: ${fileName}`);
            res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);

            res.download(filePath, fileName);
          } catch (err) {
            logger.error(`Error downloading backup ${fileId}: ${err}`);
            res.status(500).send('Server error');
          }
    }
};

module.exports = backupController;