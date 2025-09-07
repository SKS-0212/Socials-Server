// user-defined imports
import app from './app';
import { config } from './config/index';
import { connectMongoDB } from './db';
import { logger } from './utils/logger';
import { Server } from 'http';

const PORT = config.PORT;

let server: Server;

connectMongoDB()
    .then(() => {
        // Start the server
        server = app.listen(PORT, () => {
            logger.info(`Server running in ${config.NODE_ENV} mode on port ${PORT}`);
        });
    }).catch((error) => {
        logger.error("Error connecting to MongoDB:", error);
        process.exit(1); // Exit the process with failure
    });

// Handle graceful shutdown
const gracefulShutdown = (signal: string) => {
    console.log(`${signal} received. Shutting down gracefully...`); // Console log for immediate visibility
    logger.info(`${signal} received. Shutting down gracefully...`);

    if (server) {
        server.close(() => {
            console.log('Server closed successfully'); // Console log for immediate visibility
            logger.info('Server closed successfully');
            process.exit(0);
        });

        // Force close after timeout
        setTimeout(() => {
            console.log('Could not close connections in time, forcefully shutting down'); // Console log for immediate visibility
            logger.error('Could not close connections in time, forcefully shutting down');
            process.exit(0); // Changed to exit code 0 to avoid "Failed" message
        }, 5000); // Reduced timeout to 5 seconds
    } else {
        process.exit(0);
    }
};

// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGHUP', () => gracefulShutdown('SIGHUP'));

// Special handling for Windows CTRL+C (may help in PowerShell environment)
if (process.platform === 'win32') {
    const rl = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.on('SIGINT', () => {
        console.log('CTRL+C detected via readline');
        process.emit('SIGINT', 'SIGINT');
    });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    // Close server & exit process
    if (server) {
        server.close(() => process.exit(1));
    }
});
