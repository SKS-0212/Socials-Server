import { Request, Response } from "express";
import { generateRandomOTP, generateUsername, ResponseHandler, IUser } from "@socials/common";
import { logger } from "../utils/logger";
import { emailService, generateResetToken, verifyGoogleToken } from "../services/index";
import { generateAccessToken, generateAccountCreationToken, generateRefreshToken } from "../services/index";
import { getCollection, ECollectionSchema } from "../db/index";
import { config } from "../config/index";
import { comparePassword, hashPassword } from "../utils/password_hashing";

const newUsers = new Map<string, { email: string, OTP: string, expiration: Date }>();
const forgotPasswordOTPs = new Map<string, { email: string, OTP: string, expiration: Date }>();

export const signupWithEmail = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return ResponseHandler.success(
                res,
                400,
                { success: false, error: "email is required" }
            )
        }

        const existingUser = await (await getCollection(ECollectionSchema.USER, null)).findOne({ email });
        if (existingUser) {
            return ResponseHandler.success(
                res,
                400,
                { success: false, error: "User already exists" }
            );
        }

        let otp = "123456";

        if (config.NODE_ENV === 'production') {
            otp = generateRandomOTP();
            await emailService.sendOTPEmail(email, otp);
        }
        newUsers.set(
            email,
            {
                email,
                OTP: otp,
                expiration: new Date(Date.now() + 1 * 60 * 1000)
            });

        return ResponseHandler.success(
            res,
            200,
            {
                success: true,
                message: "OTP sent to email"
            }
        )
    } catch (error) {
        logger.error("Error in signupWithEmail:", error);
        return ResponseHandler.error(
            res,
            500,
            { success: false, error: "Internal Server Error" });
    }
}

export const verifyEmailOTP = async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return ResponseHandler.success(
                res,
                400,
                { success: false, error: "email and otp are required" }
            );
        }

        const user = newUsers.get(email);
        if (!user) {
            return ResponseHandler.success(
                res,
                400,
                { success: false, error: "Invalid email" }
            );
        }

        if (user.OTP !== otp) {
            return ResponseHandler.success(
                res,
                400,
                { success: false, error: "Invalid OTP" }
            );
        }

        if (user.expiration < new Date()) {
            newUsers.delete(email);
            return ResponseHandler.success(
                res,
                400,
                { success: false, error: "OTP expired" }
            );
        }

        newUsers.delete(email);
        return ResponseHandler.success(
            res,
            200,
            {
                success: true,
                message: "Email verified successfully",
                data: { token: generateAccountCreationToken(email) }
            }
        );
    } catch (error) {
        logger.error("Error in verifyEmailOTP:", error);
        return ResponseHandler.error(
            res,
            500,
            { success: false, error: "Internal Server Error" }
        );
    }
}

export const createAccount = async (req: Request, res: Response) => {
    try {
        const {
            name,
            password,
            username,
            dob,
            bio,
            email,
        }: IUser = req.body;

        if (!password || !name || !username) {
            return ResponseHandler.success(
                res,
                400,
                { success: false, error: "token, password and name are required" }
            );
        }

        const userCollection = await getCollection(ECollectionSchema.USER, null);

        const existingUser = await userCollection.findOne({ username });
        if (existingUser) {
            return ResponseHandler.success(
                res,
                400,
                { success: false, error: "User already exists" }
            );
        }

        const user: IUser = {
            name,
            password: await hashPassword(password),
            username,
            email,
            dob: dob || "",
            bio: bio || "",
            refreshToken: "",
            profilePicture: {
                id: "",
                url: ""
            },
            avatar: {
                id: "",
                url: ""
            },
            mobileNumber: "",
            isActive: true,
            isPrivate: true,
            isBlocked: false,
            coverImage: "",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await userCollection.insertOne(user);

        return ResponseHandler.success(
            res,
            201,
            {
                success: true,
                message: "Account created successfully",
                data: {
                    refreshToken: generateRefreshToken(username),
                    accessToken: generateAccessToken(username)
                }
            }
        );

    } catch (error) {
        logger.error("Error in createAccount:", error);
        return ResponseHandler.error(
            res,
            500,
            { success: false, error: "Internal Server Error" }
        );
    }
}

export const googleAuth = async (req: Request, res: Response) => {
    try {
        const { token } = req.body;
        if (!token) {
            return ResponseHandler.success(
                res,
                400,
                { success: false, error: "token is required" }
            );
        }

        const payload = await verifyGoogleToken(token);
        if (!payload) {
            return ResponseHandler.success(
                res,
                400,
                { success: false, error: "Invalid token" }
            );
        }

        const userCollection = await getCollection<IUser>(ECollectionSchema.USER, null);
        const user = await userCollection.findOne({ email: payload.email! });

        let username: string = user?.username || "";
        if (!user) {
            const newUser: IUser = {
                name: payload.name || "user",
                email: payload.email!,
                password: "", // No password for social login
                username: generateUsername(payload.name),
                dob: "",
                bio: "",
                refreshToken: "",
                profilePicture: {
                    id: "",
                    url: payload.picture || ""
                },
                avatar: {
                    id: "",
                    url: ""
                },
                mobileNumber: "",
                isActive: true,
                isPrivate: true,
                isBlocked: false,
                coverImage: "",
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            await userCollection.insertOne(newUser);
            username = newUser.username;
        }

        return ResponseHandler.success(
            res,
            200,
            {
                success: true,
                message: "Authentication successful",
                data: {
                    refreshToken: generateRefreshToken(username),
                    accessToken: generateAccessToken(username)
                }
            }
        );
    } catch (error) {
        logger.error("Error in googleAuth:", error);
        return ResponseHandler.error(
            res,
            500,
            { success: false, error: "Internal Server Error" }
        );
    }
}

export const resendOTP = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) {
            return ResponseHandler.success(
                res,
                400,
                { success: false, error: "Email is required" }
            );
        }

        const userCollection = await getCollection<IUser>(ECollectionSchema.USER, null);
        const user = await userCollection.findOne({ email });

        if (!user) {
            return ResponseHandler.success(
                res,
                404,
                { success: false, error: "User not found" }
            );
        }

        // Generate and send 

        let otp = "123456";

        if (config.NODE_ENV === 'production') {
            otp = generateRandomOTP();
            await emailService.sendOTPEmail(email, otp);
        }

        newUsers.set(
            email,
            {
                email,
                OTP: otp,
                expiration: new Date(Date.now() + 1 * 60 * 1000)
            }
        );

        return ResponseHandler.success(
            res,
            200,
            {
                success: true,
                message: "OTP sent successfully",
            }
        );

    } catch (error) {
        logger.error("Error in resendOTP:", error);
        return ResponseHandler.error(
            res,
            500,
            { success: false, error: "Internal Server Error" }
        );
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return ResponseHandler.success(
                res,
                400,
                { success: false, error: "Username and password are required" }
            );
        }

        const userCollection = await getCollection<IUser>(ECollectionSchema.USER, null);
        const user = await userCollection.findOne({ username });

        if (!user) {
            return ResponseHandler.success(
                res,
                404,
                { success: false, error: "User not found" }
            );
        }

        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return ResponseHandler.success(
                res,
                401,
                { success: false, error: "Invalid password" }
            );
        }

        return ResponseHandler.success(
            res,
            200,
            {
                success: true,
                message: "Login successful",
                data: {
                    refreshToken: generateRefreshToken(user.username),
                    accessToken: generateAccessToken(user.username)
                }
            }
        );
    } catch (error) {
        logger.error("Error in login:", error);
        return ResponseHandler.error(
            res,
            500,
            { success: false, error: "Internal Server Error" }
        );
    }
}


export const sendForgotPasswordOTP = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) {
            return ResponseHandler.success(
                res,
                400,
                { success: false, error: "Email is required" }
            );
        }

        const userCollection = await getCollection<IUser>(ECollectionSchema.USER, null);
        const user = await userCollection.findOne({ email });

        if (!user) {
            return ResponseHandler.success(
                res,
                404,
                { success: false, error: "User not found" }
            );
        }

        // Generate and send OTP

        let otp = "123456";

        if (config.NODE_ENV === 'production') {
            otp = generateRandomOTP();
            await emailService.sendOTPEmail(email, otp);
        }
        forgotPasswordOTPs.set(
            email,
            {
                email,
                OTP: otp,
                expiration: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiry
            });
        return ResponseHandler.success(
            res,
            200,
            {
                success: true,
                message: "OTP sent successfully",
                data: {
                    otp: config.NODE_ENV === 'development' ? otp : undefined
                }
            }
        );

    } catch (error) {
        logger.error("Error in sendForgotPasswordOTP:", error);
        return ResponseHandler.error(
            res,
            500,
            { success: false, error: "Internal Server Error" }
        );
    }
}


export const verifyForgotPasswordOTP = async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return ResponseHandler.success(
                res,
                400,
                { success: false, error: "Email, OTP and new password are required" }
            );
        }

        const userCollection = await getCollection<IUser>(ECollectionSchema.USER, null);
        const user = await userCollection.findOne({ email });

        if (!user) {
            return ResponseHandler.success(
                res,
                404,
                { success: false, error: "User not found" }
            );
        }

        const storedOTP = forgotPasswordOTPs.get(email);
        if (!storedOTP) {
            return ResponseHandler.success(
                res,
                400,
                { success: false, error: "No OTP found for this email" }
            );
        }
        // Verify OTP
        if (storedOTP.OTP !== otp) {
            return ResponseHandler.success(
                res,
                401,
                { success: false, error: "Invalid OTP" }
            );
        }

        if (storedOTP.expiration < new Date()) {
            forgotPasswordOTPs.delete(email);
            return ResponseHandler.success(
                res,
                400,
                { success: false, error: "OTP expired" }
            );
        }


        forgotPasswordOTPs.delete(email);
        return ResponseHandler.success(
            res,
            200,
            {
                success: true,
                message: "OTP verified successfully",
                data: { token: generateResetToken(email) }
            }
        );

    } catch (error) {
        logger.error("Error in verifyForgotPasswordOTP:", error);
        return ResponseHandler.error(
            res,
            500,
            { success: false, error: "Internal Server Error" }
        );
    }
}

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return ResponseHandler.success(
                res,
                400,
                { success: false, error: "Email and new password are required" }
            );
        }

        const userCollection = await getCollection<IUser>(ECollectionSchema.USER, null);
        const user = await userCollection.findOne({ email });

        if (!user) {
            return ResponseHandler.success(
                res,
                404,
                { success: false, error: "User not found" }
            );
        }

        const hashedPassword = await hashPassword(password);
        await userCollection.updateOne(
            { email },
            { $set: { password: hashedPassword, updatedAt: new Date() } }
        );
        return ResponseHandler.success(
            res,
            200,
            { success: true, message: "Password reset successfully" }
        );
    } catch (error) {
        logger.error("Error in resetPassword:", error);
        return ResponseHandler.error(
            res,
            500,
            { success: false, error: "Internal Server Error" }
        );
    }
}