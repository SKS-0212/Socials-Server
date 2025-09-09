
// types/express.d.ts
declare global {
    namespace Express {
        interface Request {
            user?: {
                username: string;
                // Add other user properties as needed
                id?: string;
                email?: string;
            };
        }
    }
}

export { };