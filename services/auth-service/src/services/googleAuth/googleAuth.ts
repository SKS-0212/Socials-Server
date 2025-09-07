import { OAuth2Client } from 'google-auth-library';
import { config } from '../../config/index';

const client = new OAuth2Client(config.GOOGLE_CLIENT_ID!);

export const verifyGoogleToken = async (token: string) => {
    try {
        // verify token with Google
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: config.GOOGLE_CLIENT_ID!,
        });

        const payload = ticket.getPayload();
        return payload;
    } catch (error) {
        console.error('Error verifying Google token:', error);
        throw new Error('Invalid Google token');
    }
};
