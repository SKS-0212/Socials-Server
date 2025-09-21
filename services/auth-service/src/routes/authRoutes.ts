import { Router } from "express";
import * as authController from "../controllers/authControllers";
import { verifyAccountToken, verifyResetTokenMiddleware } from "../middlewares/authMiddlewares";

export const authRouter = Router();

// public routes
authRouter.route("/signupWithEmail").post(authController.signupWithEmail);
authRouter.route("/verifyOTP").post(authController.verifyEmailOTP);
authRouter.route("/resendOTP").post(authController.resendOTP);
authRouter.route("/google").post(authController.googleAuth);
authRouter.route("/login").post(authController.login);
authRouter.route("/sendForgotPasswordOTP").post(authController.sendForgotPasswordOTP);
authRouter.route("/verifyForgotPasswordOTP").post(authController.verifyForgotPasswordOTP);

// protected routes
authRouter.route("/createAccount").post(verifyAccountToken, authController.createAccount);
authRouter.route("/resetPassword").post(verifyResetTokenMiddleware, authController.resetPassword);
export default authRouter;