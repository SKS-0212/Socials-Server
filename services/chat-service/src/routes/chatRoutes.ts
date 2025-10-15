import { Router, Request, Response } from "express";


const chatRouter = Router();

chatRouter.route("/").get(
    (_: Request, res: Response) => {
        return res.status(200);
    }
)

export default chatRouter;