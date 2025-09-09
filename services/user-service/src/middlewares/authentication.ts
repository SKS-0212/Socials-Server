import { NextFunction, Request, Response } from "express";

import { ResponseHandler } from "@socials/common";

export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
    try {
        const headers = req.headers

        console.log("Headers:", headers);

        if (!headers || !headers['x-username']) {
            return ResponseHandler.error(res, 401, { success: false, error: "Unauthorized" });
        }

        const username = headers['x-username'] as string;


        (req as any).user = {
            username
        }

        next();

    } catch (error) {

    }
};

