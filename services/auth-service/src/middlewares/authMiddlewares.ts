import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { verifyAccessToken, verifyAccountCreationToken, verifyRefreshToken } from "../services/index";
import { ResponseHandler } from "@socials/common";


export const verifyAccountToken = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers["authorization"]?.split(" ")[1];
        if (!token) {
            return ResponseHandler.error(res, 401, { success: false, error: "Unauthorized" });
        }

        const { email } = verifyAccountCreationToken(token);
        req.body.email = email;
        next();
    } catch (error) {
        logger.error("error in validating account creation token:", error);
        return ResponseHandler.error(res, 401, { success: false, error: "Unauthorized" });
    }
}

export const verifyAccessTokenMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers["authorization"]?.split(" ")[1];
        if (!token) {
            return ResponseHandler.error(res, 401, { success: false, error: "Unauthorized" });
        }

        const { username } = verifyAccessToken(token);

        req.body = { ...req.body, username };
        next();
    } catch (error) {
        logger.error("error in validating access token:", error);
        return ResponseHandler.error(res, 401, { success: false, error: "Unauthorized" });
    }
}

export const verifyRefreshTokenMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers["authorization"]?.split(" ")[1];
        if (!token) {
            return ResponseHandler.error(res, 401, { success: false, error: "Unauthorized" });
        }

        const { username } = verifyRefreshToken(token);
        req.body = { ...req.body, username };
        next();
    } catch (error) {
        logger.error("error in validating refresh token:", error);
        return ResponseHandler.error(res, 401, { success: false, error: "Unauthorized" });
    }
}