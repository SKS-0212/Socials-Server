export interface IEnvSchema {
    PORT: string | number;
    NODE_ENV: 'development' | 'production' | 'test';

    MONGO_URI: string;

    EMAIL_USER: string;
    EMAIL_PASSWORD: string;
    EMAIL_FROM_NAME: string;
    EMAIL_FROM_ADDRESS: string;

    JWT_ACCOUNT_CREATION_SECRET: string;
    JWT_REFRESH_SECRET?: string;
    JWT_ACCESS_SECRET?: string;

    GOOGLE_CLIENT_ID?: string;
}