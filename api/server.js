require('dotenv').config();

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const express = require('express');
const cors = require('cors');
const app = express();
const sequelize = require('./sequelize');
const { createLogger } = require('../config/logConfig.js');
const logger = createLogger('server');

logger.info('Starting server');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        servers: [
            {
                url: process.env.REACT_APP_API_URL + ":" + process.env.REACT_APP_API_PORT + '/api/'
            }
        ]
    },
    apis: ['./api/v1/swagger.yml'] 
};

logger.info('Starting Swagger');
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

sequelize.sync().then(() => {
    console.log('Database synced');
    logger.info('Database synced');
});

app.use(express.json());

app.use(cors());

const deviceRoutes = require('./v1/routes/deviceRoutes');
const backupRoutes = require('./v1/routes/backupRoutes');
const scheduleRoutes = require('./v1/routes/scheduleRoutes');
const userRoutes = require('./v1/routes/userRoutes');
const coreRoutes = require('./v1/routes/coreRoutes');
const reportRoutes = require('./v1/routes/reportRoutes');

app.use('/api', deviceRoutes);
app.use('/api', backupRoutes);
app.use('/api', scheduleRoutes);
app.use('/api', userRoutes);
app.use('/api', coreRoutes);
app.use('/api', reportRoutes);

// Import node-cron and report generation function
const cron = require('node-cron');
const reportController = require('./v1/controllers/reportController');

// Convert a human-readable schedule to a cron schedule
function timeToCronExpression(time) {
    time = String(time);
    while (time.length < 4) {
        time = '0' + time;
    }

    let hours = time.substring(0, 2);
    let minutes = time.substring(2, 4);

    return `${minutes} ${hours} * * *`;
}

const time = process.env.REACT_APP_AUTOBK_REPORT_TIME;
logger.info(`Report generation time: ${time}`);
const cronExpression = timeToCronExpression(time);
cron.schedule(cronExpression, () => {
    logger.info('Cron job running');
    // Get the current date and time
    const now = new Date();

    // Get the date and time 24 hours ago
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Format the dates as strings in the format 'YYYY-MM-DD'
    const end = now.toISOString();
    const start = yesterday.toISOString();
    // Create mock request and response objects
    const req = {
        query: {
            start: start,
            end: end,
        }
    };
    const res = {
        json: (data) => console.log(data), // status, filePath
        status: function(statusCode) {
        this.statusCode = statusCode;
        return this;
        },
        send: (data) => console.log(data)
    };

    reportController.getReport(req, res);
})


module.exports = app;