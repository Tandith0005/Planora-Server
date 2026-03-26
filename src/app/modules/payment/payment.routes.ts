import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { PaymentValidation } from "./payment.validation.js";
import { PaymentController } from "./payment.controller.js";
const router = express.Router();

router.post(
  "/create-checkout",
  authMiddleware,
  validateRequest(PaymentValidation.createCheckoutSchema),
  PaymentController.createCheckoutSession
);

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  PaymentController.stripeWebhook
);

export const PaymentRoutes = router;