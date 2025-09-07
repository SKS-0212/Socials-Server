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



// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    // Close server & exit process
    if (server) {
        server.close(() => process.exit(1));
    }
});
