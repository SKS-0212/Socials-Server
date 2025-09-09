import { Application } from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { config } from '../config/index';
import { logger } from '../utils/logger';
import { ProxyErrorResponse, ServiceConfig } from "../config/serviceConfig";



class ServiceProxy {
    private static readonly serviceConfigs: ServiceConfig[] = [
        {
            path: '/auth/',
            url: config.AUTH_SERVICE_URL!,
            pathRewrite: { '^/': '/auth/' },
            name: 'auth-service',
            timeout: 5000,
        },
        {
            path: '/api/v1/user/',
            url: config.USER_SERVICE_URL!,
            pathRewrite: { '^/': '/api/v1/user/' },
            name: 'user-service',
            timeout: 5000,
        },
        {
            path: '/public/user/',
            url: config.USER_SERVICE_URL!,
            pathRewrite: { '^/': '/public/user/' },
            name: 'user-service',
            timeout: 5000,
        }
    ];

    private static createProxyOptions(service: ServiceConfig): Options {
        return {
            target: service.url,
            changeOrigin: true,
            pathRewrite: service.pathRewrite,
            timeout: service.timeout || 3000,
            logger: logger,
            on: {
                error: ServiceProxy.handleProxyError,
                proxyReq: ServiceProxy.handleProxyRequest,
                proxyRes: ServiceProxy.handleProxyResponse,
            },
        };
    }

    private static handleProxyError(err: Error, req: any, res: any): void {
        logger.error(`Proxy error for ${req.path}:`, err);

        const errorResponse: ProxyErrorResponse = {
            message: 'Service unavailable',
            status: 503,
            timestamp: new Date().toISOString(),
        };

        res
            .status(503)
            .setHeader('Content-Type', 'application/json')
            .end(JSON.stringify(errorResponse));
    }

    private static handleProxyRequest(proxyReq: any, req: any): void {
        logger.debug(`Proxying request to ${req.path}`);

        if (req.body && Object.keys(req.body).length) {
            const bodyData = JSON.stringify(req.body);

            // Rewrite headers
            proxyReq.setHeader('Content-Type', 'application/json');
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));

            // Write body
            proxyReq.write(bodyData);
        }
    }


    private static handleProxyResponse(proxyRes: any, req: any): void {
        logger.debug(`Received response for ${req.path}`);
    }

    public static setupProxy(app: Application): void {
        ServiceProxy.serviceConfigs.forEach((service) => {
            const proxyOptions = ServiceProxy.createProxyOptions(service);
            app.use(service.path, createProxyMiddleware(proxyOptions));
            logger.info(`Configured proxy for ${service.name} at ${service.path}`);
        });
    }
}

export const proxyServices = (app: Application): void => {
    ServiceProxy.setupProxy(app);
};