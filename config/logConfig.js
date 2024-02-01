const winston = require('winston');

const fs = require('fs');
const dir = './logs';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

const syslogFormat = winston.format.printf(({ level, message, timestamp, moduleName }) => {
    const modulePart = moduleName ? `[${moduleName}] ` : ''; 
    return `${timestamp} ${level.toUpperCase()} ${modulePart}: ${message}`;
});

const createLogger = (moduleName) => {
    return winston.createLogger({
        level: 'info',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format((info) => {
                if (moduleName) {
                    info.moduleName = moduleName;
                }
                return info;
            })(),
            syslogFormat
        ),
        transports: [
            new winston.transports.File({ filename: './logs/error.log', level: 'error' }),
            new winston.transports.File({ filename: './logs/combined.log' })
        ],
    });
};

const defaultLogger = createLogger();

module.exports = { defaultLogger, createLogger };