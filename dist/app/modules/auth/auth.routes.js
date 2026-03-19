import express from "express";
import { AuthController } from "./auth.controller.js";
const router = express.Router();
router.post("/register", AuthController.registerUser);
router.get("/verify-email", AuthController.verifyEmail);
router.post("/login", AuthController.loginUser);
router.post("/refresh-token", AuthController.refreshTokenHandler);
router.post("/logout", AuthController.logoutUser);
export const AuthRoutes = router;
//# sourceMappingURL=auth.routes.js.map