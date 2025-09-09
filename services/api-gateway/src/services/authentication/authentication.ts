
import { Request, Response } from "express";
import jwt from "jsonwebtoken"
import { IUser, ResponseHandler } from "@socials/common";
import { ECollectionSchema, getCollection } from "../../db";
import { config } from "../../config";

export const authenticateRequest = async (req: Request, res: Response) => {
    try {
        const token = req.headers["authorization"]?.split(" ")[1];
        if (!token) {
            return ResponseHandler.error(res, 401, { success: false, error: "Unauthorized" });
        }

        const { username } = verifyAccessToken(token);

        const userColl = await getCollection<IUser>(ECollectionSchema.USER, null);

        const user = await userColl.findOne(
            {
                username: username
            }
        )

        if (!user) {
            return ResponseHandler.error(res, 401, { success: false, error: "Unauthorized" });
        }

        req.headers["x-username"] = user.username;

    } catch (error) {
        console.error("Error authenticating request:", error);
        return ResponseHandler.error(res, 401, { success: false, error: "Unauthorized" });
    }
}

export const verifyAccessToken = (token: string): { username: string } => {
    const secret = config.JWT_ACCESS_SECRET!;
    return jwt.verify(token, secret) as { username: string };
};