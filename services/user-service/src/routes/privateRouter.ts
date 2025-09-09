import { Router } from "express";
import { getCurrentUser } from "../controllers/userController";
import { authenticateUser } from "../middlewares/authentication";

const privateRouter = Router();


privateRouter.route("/").get(authenticateUser, getCurrentUser);

export default privateRouter;