import express, { Request, Response } from "express";
import cors from "cors"
import helmet from "helmet";
import morgan from "morgan";


import limiter from "./middlewares/rateLimiter";
import { logger } from "./utils/logger";
import { proxyServices } from "./services/proxyService";

const app = express();


app.use(helmet())
app.use(cors())
app.use(limiter)
app.use(express.json())
app.use(morgan('dev'));


app.get("/health", (req: Request, res: Response) => {
    return res.status(200).json(
        {
            message: 'Welcome to Socials API',
            service_name: 'api-gateway',
            status: 'Server is running',
            version: '1.0.0'
        }
    )
})

proxyServices(app);


app.use((req: Request, res: Response) => {
    logger.warn(`Resource not found: ${req.method} ${req.url}`);
    res.status(404).json({ message: 'resource not found' });
});

// Error handling middleware
app.use((err: Error, _: Request, res: Response) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({ message: 'Internal server error' });
});


export default app;