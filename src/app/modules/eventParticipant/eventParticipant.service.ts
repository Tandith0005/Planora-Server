import status from "http-status";
import { prisma } from "../../lib/prisma.js";
import AppError from "../../utils/AppError.js";
import {
  EventType,
  ParticipantStatus,
} from "../../../generated/client/enums.js";

const joinEvent = async (userId: string, eventId: string) => {
  // 1. Get event
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new AppError("Event not found", status.NOT_FOUND);
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

    return prisma.eventParticipant.create({
      data: {
        userId,
        eventId,
        status: statusValue,
        isPaid: true,
      },
    });
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

  await prisma.payment.create({
    data: {
      userId,
      eventId,
      amount: event.registrationFee,
      status: "PENDING",
    },
  });

  if (!participant.isPaid && event.registrationFee > 0) {
    throw new AppError("User has not completed payment", status.BAD_REQUEST);
  }

  return {
    message: "Payment required to complete registration",
    participant,
  };
};

const approveParticipant = async (
  ownerId: string,
  eventId: string,
  participantId: string,
) => {
  // 1. Check ownership
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event || event.creatorId !== ownerId) {
    throw new AppError("Not authorized", status.FORBIDDEN);
  }

  // 2. Atomic update
  const result = await prisma.eventParticipant.updateMany({
    where: {
      id: participantId,
      eventId: eventId,
    },
    data: {
      status: ParticipantStatus.APPROVED,
    },
  });

  if (result.count === 0) {
    throw new AppError("Participant not found in this event", status.NOT_FOUND);
  }

  return { message: "Participant approved" };
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

  const result = await prisma.eventParticipant.updateMany({
    where: {
      id: participantId,
      eventId: eventId,
    },
    data: {
      status: ParticipantStatus.REJECTED,
    },
  });

  if (result.count === 0) {
    throw new AppError("Participant not found in this event", status.NOT_FOUND);
  }

  return { message: "Participant rejected" };
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

  const result = await prisma.eventParticipant.updateMany({
    where: {
      id: participantId,
      eventId: eventId,
    },
    data: {
      status: ParticipantStatus.BANNED,
    },
  });

  if (result.count === 0) {
    throw new AppError("Participant not found in this event", status.NOT_FOUND);
  }

  return { message: "Participant banned" };
};

const confirmPayment = async (userId: string, eventId: string) => {
  // 1. Find payment
  const payment = await prisma.payment.findFirst({
    where: {
      userId,
      eventId,
      status: "PENDING",
    },
  });

  if (!payment) {
    throw new AppError("Payment not found", status.NOT_FOUND);
  }

  // 2. Update payment
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "SUCCESS",
      transactionId: "TXN_" + Date.now(), // mock
    },
  });

  // 3. Update participant
  await prisma.eventParticipant.updateMany({
    where: {
      userId,
      eventId,
    },
    data: {
      isPaid: true,
    },
  });

  return { message: "Payment successful" };
};

export const EventParticipantService = {
  joinEvent,
  approveParticipant,
  rejectParticipant,
  banParticipant,
  confirmPayment,
};
