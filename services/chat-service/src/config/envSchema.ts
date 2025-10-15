export interface IEnvSchema {
    PORT: string | number;
    NODE_ENV: 'development' | 'production' | 'test';
    MONGO_URI: string;
}