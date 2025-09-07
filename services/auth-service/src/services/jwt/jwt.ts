import { config } from '../../config/index';
import jwt, { SignOptions } from 'jsonwebtoken';

export const generateAccountCreationToken = (email: string): string => {
    const payload = { email };
    const secret = config.JWT_ACCOUNT_CREATION_SECRET!;
    const options: SignOptions = { expiresIn: '15m' };
    return jwt.sign(payload, secret, options);
};

export const verifyAccountCreationToken = (token: string): { email: string } => {
    const secret = config.JWT_ACCOUNT_CREATION_SECRET!;
    return jwt.verify(token, secret) as { email: string };
};

export const generateAccessToken = (username: string): string => {
    const payload = { username };
    const secret = config.JWT_ACCESS_SECRET!;
    const options: SignOptions = { expiresIn: '7d' };
    return jwt.sign(payload, secret, options);
};

export const verifyAccessToken = (token: string): { username: string } => {
    const secret = process.env.JWT_ACCESS_SECRET!;
    return jwt.verify(token, secret) as { username: string };
};

export const generateRefreshToken = (username: string): string => {
    const payload = { username };
    const secret = config.JWT_REFRESH_SECRET!;
    const options: SignOptions = { expiresIn: '30d' };
    return jwt.sign(payload, secret, options);
};

export const verifyRefreshToken = (token: string): { username: string } => {
    const secret = process.env.JWT_REFRESH_SECRET!;
    return jwt.verify(token, secret) as { username: string };
};
