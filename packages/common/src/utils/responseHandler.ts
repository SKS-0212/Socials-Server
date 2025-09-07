import { Response } from 'express';

export interface ResponsePayload {
    success?: boolean;
    message?: string;
    data?: any;
    error?: any;
    token?: string;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
    };
}

export class ResponseHandler {
    /**
     * Send success response
     * @param res Express Response object
     * @param statusCode HTTP status code
     * @param payload Response payload
     */
    public static success(res: Response, statusCode: number = 200, payload: ResponsePayload = {}) {
        return res.status(statusCode).json({
            success: true,
            ...payload
        });
    }

    /**
     * Send error response
     * @param res Express Response object
     * @param statusCode HTTP status code
     * @param payload Response payload
     */
    public static error(res: Response, statusCode: number = 500, payload: ResponsePayload = {}) {
        return res.status(statusCode).json({
            success: false,
            ...payload
        });
    }
}