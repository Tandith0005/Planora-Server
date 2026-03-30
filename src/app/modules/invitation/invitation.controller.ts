import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import { InvitationService } from "./invitation.service.js";
import { sendResponse } from "../../utils/sendResponse.js";


const sendInvitation = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new AppError("User not authenticated", status.UNAUTHORIZED);
  }

  const { eventId } = req.params;
  const { invitedUserId } = req.body;  

  if (!invitedUserId) {
    throw new AppError("invitedUserId is required", status.BAD_REQUEST);
  }

  const result = await InvitationService.sendInvitation(
    user.userId,
    eventId as string,
    invitedUserId
  );

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Invitation sent successfully",
    data: result,
  });
});

const getMyInvitations = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new AppError("User not authenticated", status.UNAUTHORIZED);
  }

  const result = await InvitationService.getMyInvitations(user.userId);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Invitations fetched successfully",
    data: result,
  });
})

const acceptInvitation = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new AppError("User not authenticated", status.UNAUTHORIZED);
  }

  const { invitationId } = req.params;

  const result = await InvitationService.acceptInvitation(
    user.userId,
    invitationId as string
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Invitation accepted successfully",
    data: result,
  });
});

const declineInvitation = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new AppError("User not authenticated", status.UNAUTHORIZED);
  }

  const { invitationId } = req.params;

  const result = await InvitationService.declineInvitation(
    user.userId,
    invitationId as string
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Invitation declined successfully",
    data: result,
  });
});

export const InvitationController = {
  sendInvitation,
  getMyInvitations,
  acceptInvitation,
  declineInvitation,
};