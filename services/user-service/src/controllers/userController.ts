import { Request, Response } from "express";
import { getCollection, ECollectionSchema } from "../db/index";
import { logger } from "../utils/logger";
import { ResponseHandler } from "@socials/common";

export const checkUsername = async (req: Request, res: Response) => {
    try {
        const { username } = req.body;
        if (!username) {
            return ResponseHandler.success(
                res,
                400,
                { success: false, error: "username is required" }
            );
        }

        const existingUser = await (await getCollection(ECollectionSchema.USER, null)).findOne({ username });
        if (existingUser) {
            return ResponseHandler.success(
                res,
                400,
                { success: false, error: "User already exists" }
            );
        }

        return ResponseHandler.success(
            res,
            200,
            { success: true, message: "Username is available" }
        );
    } catch (error) {
        logger.error("Error in checkUsername:", error);
        return ResponseHandler.error(
            res,
            500,
            { success: false, error: "Internal Server Error" }
        );
    }
};

export const getCurrentUser = async (req: Request, res: Response) => {
    try {
        // Use type assertion to tell TypeScript that req has a user property
        const username = (req as any).user?.username;

        const user = await (await getCollection(ECollectionSchema.USER, null))
            .findOne(
                { username },
                {
                    projection: {
                        _id: 0,
                        password: 0,
                        refreshToken: 0,
                        isBlocked: 0,
                        createdAt: 0,
                        updatedAt: 0,
                    }
                }
            );

        if (!user) {
            return ResponseHandler.success(
                res,
                404,
                { success: false, error: "User not found" }
            );
        }

        return ResponseHandler.success(
            res,
            200,
            { success: true, data: user }
        );
    } catch (error) {
        logger.error("Error in getCurrentUser:", error);
        return ResponseHandler.error(
            res,
            500,
            { success: false, error: "Internal Server Error" }
        );
    }
};