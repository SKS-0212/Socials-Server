export interface IEnvSchema {
    PORT: string | number;
    NODE_ENV: 'development' | 'production' | 'test'

    MONGO_URI: string;

    AUTH_SERVICE_URL: string;
    USER_SERVICE_URL: string;

    JWT_ACCESS_SECRET: string;
}