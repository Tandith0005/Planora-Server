import express from "express";
import { AuthController } from "./auth.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";
import { Role } from "../../../generated/client/enums.js";


const router = express.Router();

router.get("/me", authMiddleware, AuthController.getMe);
router.patch("/me", authMiddleware, AuthController.updateMe);
router.get("/search", authMiddleware, AuthController.searchUsers);
router.post("/register", AuthController.registerUser);
router.get("/verify-email", AuthController.verifyEmail);
router.post("/login", AuthController.loginUser);
router.post("/refresh-token", AuthController.refreshTokenHandler);
router.post("/logout", AuthController.logoutUser);
router.delete("/", authMiddleware, AuthController.deleteUser);
router.patch("/adminSoftDelete/:id", authMiddleware, authorize(Role.ADMIN), AuthController.adminDeleteUser);


export const AuthRoutes = router;