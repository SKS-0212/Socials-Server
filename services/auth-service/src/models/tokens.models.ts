export interface IBlacklistedToken {
    token: string;          // The JWT or refresh token itself
    createdAt: Date;        // When it was blacklisted
    expiresAt: Date;       // Optional: Expiry time of token, so cleanup jobs can remove it
    type: ETokenType;       // Type of the token (ACCESS, REFRESH, etc.)
}

export enum ETokenType {
    ACCESS = "ACCESS",
    REFRESH = "REFRESH",
    ACCOUNT_CREATION = "ACCOUNT_CREATION",
    RESET = "RESET"
}