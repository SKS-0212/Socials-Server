import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';


// user-defined imports
import { logger } from './utils/logger';
import authRouter from './routes/authRoutes';

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));

// Apply rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// Routes
app.get('/api/v1/auth/health', (_: Request, res: Response) => {
    res.json({
        message: 'Welcome to Socials API',
        service_name: 'auth-service',
        status: 'Server is running',
        version: '1.0.0'
    });
});

app.use("/api/v1/auth", authRouter)

// Error handling middleware
app.use((err: Error, _: Request, res: Response, __: NextFunction) => {
    logger.error(`Error: ${err.message}`);
    res.status(500).json({
        error: {
            message: 'Internal Server Error',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        }
    });
});

// 404 middleware
app.use((_: Request, res: Response) => {
    res.status(404).json({
        error: {
            message: 'Resource not found'
        }
    });
});

export default app;
