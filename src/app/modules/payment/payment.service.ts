import status from "http-status";
import { prisma } from "../../lib/prisma.js";
import AppError from "../../utils/AppError.js";
import { envVars } from "../../../config/envVars.js";
import { stripe } from "../../../config/stripe.js";
import Stripe from "stripe";
import { ParticipantStatus } from "../../../generated/client/enums.js";
import createNotification from "../../utils/createNotification.js";

const createCheckoutSession = async (userId: string, eventId: string) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) throw new AppError("Event not found", status.NOT_FOUND);
  if (event.registrationFee <= 0) {
    throw new AppError("This event is free", status.BAD_REQUEST);
  }

  // Check if user already has a pending participant record
  const existingParticipant = await prisma.eventParticipant.findUnique({
    where: {
      userId_eventId: { userId, eventId },
    },
  });

  if (!existingParticipant) {
    throw new AppError("You must join the event first", status.BAD_REQUEST);
  }
  if (existingParticipant.status === "BANNED") {
    throw new AppError("You are banned from this event", status.FORBIDDEN);
  }

  if (existingParticipant.isPaid) {
    throw new AppError(
      "You have already paid for this event",
      status.BAD_REQUEST,
    );
  }

  let payment = await prisma.payment.findFirst({
    where: {
      userId,
      eventId,
      status: "PENDING",
    },
    orderBy: { createdAt: "desc" },
  });

  if (!payment) {
    // If no pending payment exists, create one
    payment = await prisma.payment.create({
      data: {
        userId,
        eventId,
        amount: event.registrationFee,
        status: "PENDING",
      },
    });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "bdt",
          product_data: {
            name: event.title,
            description: event.description.substring(0, 100),
          },
          unit_amount: Math.round(event.registrationFee * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${envVars.STRIPE_SUCCESS_URL}/events/${eventId}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${envVars.STRIPE_CANCEL_URL}/events/${eventId}`,
    metadata: {
      userId,
      eventId,
    },
  });

  return { url: session.url, sessionId: session.id };
};

const handleStripeWebhook = async (req: any) => {
  const signature = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    throw new AppError("Invalid webhook signature", status.BAD_REQUEST);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.metadata?.userId;
    const eventId = session.metadata?.eventId;

    if (!userId || !eventId) {
      console.error("Missing metadata in session");
      return;
    }

    // Update Payment
    await prisma.payment.updateMany({
      where: { userId, eventId, status: "PENDING" },
      data: {
        status: "SUCCESS",
        transactionId: (session.payment_intent as string) || null,
        stripeSessionId: session.id,
      },
    });

    // Update Participant + Auto-approve
    await prisma.eventParticipant.updateMany({
      where: { userId, eventId },
      data: {
        isPaid: true,
        status: ParticipantStatus.APPROVED,
      },
    });

    await createNotification(
      userId,
      "Payment successful! You are now approved for the event.",
    );

    console.log(`Payment completed for user ${userId} on event ${eventId}`);
  }
};

export const PaymentService = {
  createCheckoutSession,
  handleStripeWebhook,
};
