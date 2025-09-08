import { Router } from "express";
import { checkUsername, getUserProfile } from "../controllers/userController";

const userRouter = Router();

// public routes
userRouter.route("/checkUsername").post(checkUsername);

// protected routes
userRouter.route("/profile").get(getUserProfile);

export default userRouter;