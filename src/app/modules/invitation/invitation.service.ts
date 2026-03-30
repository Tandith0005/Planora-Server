import status from "http-status";
import { prisma } from "../../lib/prisma.js";
import AppError from "../../utils/AppError.js";
import {
  InvitationStatus,
  ParticipantStatus,
} from "../../../generated/client/enums.js";
import createNotification from "../../utils/createNotification.js";

const sendInvitation = async (
  ownerId: string,
  eventId: string,
  invitedUserId: string,
) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event || event.creatorId !== ownerId) {
    throw new AppError("Not authorized", status.FORBIDDEN);
  }

  // already participant?
  const participant = await prisma.eventParticipant.findUnique({
    where: {
      userId_eventId: {
        userId: invitedUserId,
        eventId,
      },
    },
  });

  if (participant) {
    throw new AppError("User already joined", status.BAD_REQUEST);
  }

  // already invited?
  const existingInvite = await prisma.invitation.findFirst({
    where: {
      eventId,
      invitedUserId,
    },
  });

  if (existingInvite) {
    throw new AppError("User already invited", status.BAD_REQUEST);
  }

  const invitation = await prisma.invitation.create({
    data: {
      eventId,
      invitedUserId,
    },
  });

  await createNotification(
    invitedUserId,
    `You have been invited to "${event.title}"`,
  );

  return invitation;
};

const getMyInvitations = async (userId: string) => {
  return await prisma.invitation.findMany({
    where: { invitedUserId: userId },
    include: { event: true },
  });
}

const acceptInvitation = async (userId: string, invitationId: string) => {
  const invite = await prisma.invitation.findUnique({
    where: { id: invitationId },
    include: { event: true },
  });

  if (!invite || invite.invitedUserId !== userId) {
    throw new AppError("Invitation not found", status.NOT_FOUND);
  }

  if (invite.status !== "PENDING") {
    throw new AppError("Invitation status is not pending", status.BAD_REQUEST);
  }

  const event = invite.event;

  // update invitation
  await prisma.invitation.update({
    where: { id: invitationId },
    data: { status: InvitationStatus.ACCEPTED },
  });

  // create participant
  const participant = await prisma.eventParticipant.create({
    data: {
      userId,
      eventId: event.id,
      status:
        event.registrationFee === 0
          ? ParticipantStatus.APPROVED
          : ParticipantStatus.PENDING,
      isPaid: event.registrationFee === 0,
    },
  });


  // if paid → create payment
  if (event.registrationFee > 0) {
    return {
      requiresPayment: true,
      eventId: event.id,
      message: "Invitation accepted. Please complete payment to confirm your spot.",
    };
  }
  // if (event.registrationFee > 0) {
  //   await prisma.payment.create({
  //     data: {
  //       userId,
  //       eventId: event.id,
  //       amount: event.registrationFee,
  //       status: "PENDING",
  //     },
  //   });

  //   return {
  //     message: "Payment required",
  //     eventId: event.id,
  //   };
  // }

  await createNotification(userId, `You joined "${event.title}" successfully`);

  return participant;
};

const declineInvitation = async (userId: string, invitationId: string) => {
  const invite = await prisma.invitation.findUnique({
    where: { id: invitationId },
  });

  if (!invite || invite.invitedUserId !== userId) {
    throw new AppError("Invitation not found", status.NOT_FOUND);
  }

  return prisma.invitation.update({
    where: { id: invitationId },
    data: {
      status: InvitationStatus.DECLINED,
    },
  });
};

export const InvitationService = {
  sendInvitation,
  getMyInvitations,
  acceptInvitation,
  declineInvitation,
};
