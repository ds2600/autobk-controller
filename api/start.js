const app = require('./server');
const port = process.env.REACT_APP_API_PORT || 5000;
const host = process.env.API_IP;
const { createLogger } = require('../config/logConfig.js');
const logger = createLogger('start');

try {
    app.listen(port, host, () => {
        console.log(`AutoBk Controller API listening at http://${host}:${port}`);
        logger.info(`AutoBk Controller API listening at http://${host}:${port}`);
    });
} catch (error) {
    console.error(error);
    logger.error(error);
}