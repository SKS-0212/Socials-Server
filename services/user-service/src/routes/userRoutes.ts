import { Router } from "express";
import { checkUsername, getCurrentUser } from "../controllers/userController";

const userRouter = Router();

// public routes
userRouter.route("/checkUsername").post(checkUsername);

// protected routes
userRouter.route("/").get(getCurrentUser);

export default userRouter;