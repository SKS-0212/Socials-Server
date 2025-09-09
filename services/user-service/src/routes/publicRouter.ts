import { Router, Request, Response } from "express";

import { checkUsername } from "../controllers/userController";

const publicRouter = Router();

publicRouter.get("/health", (_: Request, res: Response) => {
    return res.json({
        message: "Welcome to Socials API",
        service_name: "user-service",
        status: "Server is running",
        version: "1.0.0"
    });
});

publicRouter.post("/check-username", checkUsername);

export default publicRouter;
