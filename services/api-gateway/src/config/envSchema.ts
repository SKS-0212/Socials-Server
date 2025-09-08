export interface IEnvSchema {
    PORT: string | number;
    NODE_ENV: 'development' | 'production' | 'test'

    AUTH_SERVICE_URL: string;
    USER_SERVICE_URL: string;
}