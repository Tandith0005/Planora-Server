import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import status from "http-status";
import { PaymentService } from "./payment.service.js";
import { sendResponse } from "../../utils/sendResponse.js";

const createCheckoutSession = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new AppError("User not authenticated", status.UNAUTHORIZED);
  }

  const { eventId } = req.body;

  const result = await PaymentService.createCheckoutSession(user.userId, eventId);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Checkout session created successfully",
    data: result,
  });
});

const stripeWebhook = async (req: Request, res: Response) => {
  try {
    await PaymentService.handleStripeWebhook(req);
    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(400).json({ error: "Webhook handler failed" });
  }
};

export const PaymentController = {
  createCheckoutSession,
  stripeWebhook,
};