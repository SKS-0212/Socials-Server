import { createLogger, format, transports } from 'winston';
import path from 'path';

const { combine, timestamp, printf, colorize } = format;

// Define interface for logger config
interface LoggerConfig {
    service?: string;
    NODE_ENV?: string;
    logDirectory?: string;
}

// Custom log format
const logFormat = printf(({ level, message, timestamp, service }) => {
    const serviceInfo = service ? `[${service}] ` : '';
    return `${timestamp} ${level}: ${serviceInfo}${message}`;
});

export const createCustomLogger = (config: LoggerConfig = {}) => {
    const logLevel = config.NODE_ENV === 'production' ? 'info' : 'debug';
    const logDirectory = config.logDirectory || 'logs';
    const service = config.service || 'app';

    return createLogger({
        defaultMeta: { service },
        level: logLevel,
        format: combine(
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            logFormat
        ),
        transports: [
            // Console transport
            new transports.Console({
                format: combine(
                    colorize(),
                    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                    logFormat
                ),
            }),
            // File transports
            new transports.File({
                filename: path.join(logDirectory, 'error.log'),
                level: 'error'
            }),
            new transports.File({
                filename: path.join(logDirectory, 'combined.log')
            }),
        ],
    });
}