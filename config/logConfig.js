const winston = require('winston');

const fs = require('fs');
const dir = './logs';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

const syslogFormat = winston.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level.toUpperCase()}: ${message}`;
  });

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        syslogFormat
    ),
    transports: [
        new winston.transports.File({ filename: './logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: './logs/combined.log' })
    ],
});

module.exports = logger;