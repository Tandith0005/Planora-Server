import express from "express";
import { AuthController } from "./auth.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";


const router = express.Router();

router.get("/me", authMiddleware, AuthController.getMe);
router.post("/register", AuthController.registerUser);
router.get("/verify-email", AuthController.verifyEmail);
router.post("/login", AuthController.loginUser);
router.post("/refresh-token", AuthController.refreshTokenHandler);
router.post("/logout", AuthController.logoutUser);

export const AuthRoutes = router;