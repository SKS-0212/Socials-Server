import dotenv from 'dotenv';

// user-defined imports
import { IEnvSchema } from './envSchema';

// Load environment variables from .env file
dotenv.config();

const envKeys: Set<keyof IEnvSchema> = new Set<keyof IEnvSchema>([
    "PORT",
    "NODE_ENV",
    "AUTH_SERVICE_URL",
    "USER_SERVICE_URL"
]);

export const config: Partial<IEnvSchema> = {};

(() => {
    for (let key of envKeys) {
        if (!process.env[key]) {
            throw new Error(`Missing environment variable: ${key}`);
        }

        switch (key) {
            case 'NODE_ENV':
                const value = process.env[key];
                if (value === 'development' || value === 'production' || value === 'test') {
                    config[key] = value;
                } else {
                    throw new Error(`Invalid value for NODE_ENV: ${value}. Expected 'development', 'production', or 'test'`);
                }
                break;
            default:
                config[key] = process.env[key] as any;
                break;
        }
    }
})()