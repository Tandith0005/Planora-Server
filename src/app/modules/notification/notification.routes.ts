import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { NotificationController } from "./notification.controller.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { NotificationValidation } from "./notification.validation.js";

const router = express.Router();

// Get my notifications
router.get(
  "/",
  authMiddleware,
  NotificationController.getMyNotifications
);

// Mark single as read
router.patch(
  "/:id/read",
  authMiddleware,
  validateRequest(NotificationValidation.notificationIdSchema),
  NotificationController.markAsRead
);

// Mark all as read
router.patch(
  "/read-all",
  authMiddleware,
  NotificationController.markAllAsRead
);

// delete all notifications
router.delete(
  "/",
  authMiddleware,
  NotificationController.deleteAllNotifications
);

export const NotificationRoutes = router;