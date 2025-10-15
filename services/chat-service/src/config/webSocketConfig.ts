import { Server } from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { logger } from '../utils/logger';

export const clients: Map<string, WebSocket> = new Map();

// Create WebSocket and Socket.IO servers
export const createWebSocketServer = (server: Server) => {
    logger.info("creating ws server")
    const wss = new WebSocketServer({ server });


    wss.on('connection', (ws: WebSocket, req) => {
        logger.info('A WebSocket user connected');


        const url = new URL(req.url || '', `http://${req.headers.host}`);
        const username = url.searchParams.get('username');

        logger.info(`WebSocket Connection Details:
            User ID: ${username || 'N/A'}
        `);

        if (!username) {
            logger.error('WebSocket connection rejected: No userId provided');
            ws.send(JSON.stringify({
                type: 'error',
                message: 'User ID is required for WebSocket connection'
            }));
            ws.close();
            return;
        }

        handleUserConnection(username, ws);

        ws.on('message', async (message: string) => {
            try {
                const data = JSON.parse(message);
                logger.info('Received data', data);

                switch (data.type) {
                    case 'login':
                        ws.send(JSON.stringify({
                            type: 'loginSuccess',
                            username: data.username,
                            message: 'Successfully logged in'
                        }));
                        break;

                    case 'send_message':
                        const senderId = data.senderId;

                        const userWS = clients.get(senderId);

                        if (userWS?.readyState === WebSocket.OPEN) {
                            userWS.send(JSON.stringify(
                                {
                                    type: 'receive_message',
                                    from: data.username,
                                    message: data.message
                                }
                            ))
                        }
                        break;
                    default:
                        logger.info('Unknown message type:', data.type);
                }
            } catch (error) {
                logger.error('Error parsing WebSocket message:', error);
            }
        });

        // Handle WebSocket disconnection
        ws.on('close', () => {
            logger.info('A WebSocket user disconnected');
            // Remove the client from all rooms
            clients.delete(username);
        });
    });
};

function handleUserConnection(username: string, ws: WebSocket) {
    if (!clients.has(username)) {
        clients.set(username, ws);
    }
}
