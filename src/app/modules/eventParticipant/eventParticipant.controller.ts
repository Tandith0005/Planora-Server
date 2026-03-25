import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { EventParticipantService } from "./eventParticipant.service.js";
import AppError from "../../utils/AppError.js";
import { Role } from "../../../generated/client/enums.js";

const joinEvent = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new AppError("User not authenticated", status.UNAUTHORIZED);
  }

  const { eventId } = req.params as { eventId: string };

  const result = await EventParticipantService.joinEvent(user.userId, eventId);

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Successfully joined the event",
    data: result,
  });
});

const approveParticipant = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new AppError("User not authenticated", status.UNAUTHORIZED);
  }

  const { eventId, participantId } = req.params as { eventId: string, participantId: string };

  const result = await EventParticipantService.approveParticipant(
    user.userId,
    eventId,
    participantId
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Participant approved successfully",
    data: result,
  });
});

const rejectParticipant = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new AppError("User not authenticated", status.UNAUTHORIZED);
  }

  const { eventId, participantId } = req.params as { eventId: string, participantId: string };

  const result = await EventParticipantService.rejectParticipant(
    user.userId,
    eventId,
    participantId
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Participant request rejected successfully",
    data: result,
  });
});

const banParticipant = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new AppError("User not authenticated", status.UNAUTHORIZED);
  }

  const { eventId, participantId } = req.params as { eventId: string, participantId: string };

  const result = await EventParticipantService.banParticipant(
    user.userId,
    eventId,
    participantId
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Participant banned successfully",
    data: result,
  });
});

const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new AppError("User not authenticated", status.UNAUTHORIZED);
  }

  const { eventId, participantId } = req.params as { eventId: string, participantId: string };

  const result = await EventParticipantService.confirmPayment(
    // user.userId,
    participantId,
    eventId,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Payment confirmed successfully",
    data: result,
  });
});

export const EventParticipantController = {
  joinEvent,
  approveParticipant,
  rejectParticipant,
  banParticipant,
  confirmPayment
};