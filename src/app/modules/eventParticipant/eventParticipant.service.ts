import status from "http-status";
import { prisma } from "../../lib/prisma.js";
import AppError from "../../utils/AppError.js";
import {
  EventType,
  ParticipantStatus,
} from "../../../generated/client/enums.js";
import createNotification from "../../utils/createNotification.js";
import { PaymentService } from "../payment/payment.service.js";

const joinEvent = async (userId: string, eventId: string) => {
  // 1. Get event
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new AppError("Event not found", status.NOT_FOUND);
  }

  // If the event is PRIVATE, users cannot self-join. They must be invited.
  if (event.type === "PRIVATE") {
    throw new AppError(
      "This is a private event. You can only join via invitation.",
      status.BAD_REQUEST,
    );
  }

  // 2. Prevent self join
  if (event.creatorId === userId) {
    throw new AppError("You cannot join your own event", status.BAD_REQUEST);
  }

  // 3. Check existing participant
  const existing = await prisma.eventParticipant.findUnique({
    where: {
      userId_eventId: {
        userId,
        eventId,
      },
    },
  });

  if (existing) {
    throw new AppError("Already joined/requested", status.BAD_REQUEST);
  }

  // let stat: ParticipantStatus = ParticipantStatus.PENDING;
  // let isPaid = false;

  // FREE EVENT
  if (event.registrationFee === 0) {
    const statusValue =
      event.type === "PUBLIC"
        ? ParticipantStatus.APPROVED
        : ParticipantStatus.PENDING;

    const participant = await prisma.eventParticipant.create({
      data: {
        userId,
        eventId,
        status: statusValue,
        isPaid: true,
      },
    });

    // Send notification for free events
    await createNotification(
      userId,
      `You have successfully joined "${event.title}"`,
    );

    return participant;
  }

  // PAID EVENT → create pending participant + payment
  const participant = await prisma.eventParticipant.create({
    data: {
      userId,
      eventId,
      status: ParticipantStatus.PENDING,
      isPaid: false,
    },
  });

  // Create dummy payment record
  // await prisma.payment.create({
  //   data: {
  //     userId,
  //     eventId,
  //     amount: event.registrationFee,
  //     status: "PENDING",
  //   },
  // });

  // ←←← STRIPE INTEGRATION STARTS HERE ←←←
  // const checkout = await PaymentService.createCheckoutSession(userId, eventId);

  return {
    requiresPayment: true,
    eventId,
    // checkoutSession: checkout,
  };
};

const approveParticipant = async (
  ownerId: string,
  eventId: string,
  participantId: string,
) => {
  // 1. Check event ownership
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event || event.creatorId !== ownerId) {
    throw new AppError(
      "You are not authorized to manage this event",
      status.FORBIDDEN,
    );
  }

  // 2. Get the participant with payment status
  const participant = await prisma.eventParticipant.findUnique({
    where: {
      id: participantId,
      eventId: eventId,
    },
  });

  if (!participant) {
    throw new AppError("Participant not found in this event", status.NOT_FOUND);
  }

  // 3. PAYMENT CHECK HERE
  if (!participant.isPaid && event.registrationFee > 0) {
    throw new AppError(
      "Cannot approve participant. User has not completed payment yet.",
      status.BAD_REQUEST,
    );
  }

  // 4. Approve the participant
  const result = await prisma.eventParticipant.update({
    where: { id: participantId },
    data: {
      status: ParticipantStatus.APPROVED,
    },
  });

  // 5. Send notification
  await createNotification(
    participant.userId,
    "Your request has been approved",
  );

  return {
    message: "Participant approved successfully",
    participant: result,
  };
};

const rejectParticipant = async (
  ownerId: string,
  eventId: string,
  participantId: string,
) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event || event.creatorId !== ownerId) {
    throw new AppError("Not authorized", status.FORBIDDEN);
  }

  const participant = await prisma.eventParticipant.findUnique({
    where: {
      id: participantId,
      eventId: eventId,
    },
  });

  if (!participant) {
    throw new AppError("Participant not found in this event", status.NOT_FOUND);
  }

  const result = await prisma.eventParticipant.update({
    where: { id: participantId },
    data: { status: ParticipantStatus.REJECTED },
  });

  // Send notification
  await createNotification(
    participant.userId,
    "Your request has been rejected",
  );

  return { message: "Participant rejected", participant: result };
};

const banParticipant = async (
  ownerId: string,
  eventId: string,
  participantId: string,
) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event || event.creatorId !== ownerId) {
    throw new AppError("Not authorized", status.FORBIDDEN);
  }

  const participant = await prisma.eventParticipant.findUnique({
    where: {
      id: participantId,
      eventId: eventId,
    },
  });

  if (!participant) {
    throw new AppError("Participant not found in this event", status.NOT_FOUND);
  }

  const result = await prisma.eventParticipant.update({
    where: { id: participantId },
    data: { status: ParticipantStatus.BANNED },
  });

  return { message: "Participant banned", participant: result };
};

// const confirmPayment = async (userId: string, eventId: string) => {
//   // 1. Find payment
//   const payment = await prisma.payment.findFirst({
//     where: {
//       userId,
//       eventId,
//       status: "PENDING",
//     },
//   });

//   if (!payment) {
//     throw new AppError("Payment not found", status.NOT_FOUND);
//   }

//   // 2. Update payment
//   await prisma.payment.update({
//     where: { id: payment.id },
//     data: {
//       status: "SUCCESS",
//       transactionId: "TXN_" + Date.now(), // mock
//     },
//   });

//   // 3. Update participant
//   await prisma.eventParticipant.updateMany({
//     where: {
//       userId,
//       eventId,
//     },
//     data: {
//       isPaid: true,
//     },
//   });

//   // 4. Send notification
//   await createNotification(userId, "Payment successful for event");

//   return { message: "Payment successful" };
// };

export const EventParticipantService = {
  joinEvent,
  approveParticipant,
  rejectParticipant,
  banParticipant,
  // confirmPayment,
};
