import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import chatRouter from './routes/chatRoutes';
import http from "node:http";
import { createWebSocketServer } from './config/webSocketConfig';

const app = express();

const server = http.createServer(app);

createWebSocketServer(server);

const corsOptions = {
    origin: "*",
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    transports: ['websocket'],
    credentials: true,
    maxAge: 86400 // CORS preflight cache time (24 hours)
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));

// Routes
app.get('/chats/health', (_: Request, res: Response) => {
    res.json({
        message: 'Welcome to Socials API',
        service_name: 'auth-service',
        status: 'Server is running',
        version: '1.0.0'
    });
});

app.use("/chats", chatRouter)

export default server;