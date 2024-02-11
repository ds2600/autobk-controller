const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

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
    const transport = new DailyRotateFile({
        filename: `${dir}/controller-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d'
    });
    
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
            transport,
        ],
    });
};

const defaultLogger = createLogger();

module.exports = { defaultLogger, createLogger };