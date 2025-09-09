import { Router } from "express";
import { createAccount, googleAuth, login, resendOTP, signupWithEmail, verifyEmailOTP } from "../controllers/authControllers";
import { verifyAccountToken } from "../middlewares/authMiddlewares";

export const authRouter = Router();

// public routes
authRouter.route("/signupWithEmail").post(signupWithEmail);
authRouter.route("/verifyOTP").post(verifyEmailOTP);
authRouter.route("/resendOTP").post(resendOTP);
authRouter.route("/google").post(googleAuth);
authRouter.route("/login").post(login);

// protected routes
authRouter.route("/createAccount").post(verifyAccountToken, createAccount);
export default authRouter;