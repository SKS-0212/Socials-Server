import { ECollectionSchema, getCollection } from "../db"
import { ETokenType, IBlacklistedToken } from "../models/tokens.models"


export const getBlacklistedToken = async (token: string) => {

    const blackListedTokenColl = await getCollection<IBlacklistedToken>(ECollectionSchema.BLACKLISTED_TOKENS, null);

    return blackListedTokenColl.findOne({ token });

}

export const blacklistToken = async (token: string, expiresAt: Date, type: ETokenType) => {

    const blackListedTokenColl = await getCollection<IBlacklistedToken>(ECollectionSchema.BLACKLISTED_TOKENS, null);
    const blacklistedToken: IBlacklistedToken = {
        token,
        createdAt: new Date(),
        expiresAt,
        type
    }
    await blackListedTokenColl.insertOne(blacklistedToken);

    return;
}