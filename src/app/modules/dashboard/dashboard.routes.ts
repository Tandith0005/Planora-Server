import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { DashboardController } from "./dashboard.controller.js";
import { authorize } from "../../middleware/authorize.middleware.js";
import { Role } from "../../../generated/client/enums.js";

const router = express.Router();

// user stats
router.get("/stats", authMiddleware, DashboardController.getStats);

// admin stats
router.get(
  "/admin-stats",
  authMiddleware,
  authorize(Role.ADMIN),
  DashboardController.getAdminStats,
);

export const DashboardRoutes = router;
