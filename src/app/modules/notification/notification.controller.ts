import { Request, Response } from "express";
import status from "http-status";
import AppError from "../../utils/AppError.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { NotificationService } from "./notification.service.js";
import { sendResponse } from "../../utils/sendResponse.js";

const getMyNotifications = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new AppError("Unauthorized", status.UNAUTHORIZED);
  }

  const result = await NotificationService.getMyNotifications(
    user.userId,
    req.query
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Notifications fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const markAsRead = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new AppError("Unauthorized", status.UNAUTHORIZED);
  }

  const { id } = req.params as { id: string };

  const result = await NotificationService.markAsRead(user.userId, id);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

const markAllAsRead = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new AppError("Unauthorized", status.UNAUTHORIZED);
  }

  const result = await NotificationService.markAllAsRead(user.userId);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

const deleteAllNotifications = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new AppError("Unauthorized", status.UNAUTHORIZED);
  }

  const result = await NotificationService.deleteAllNotifications(user.userId);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

export const NotificationController = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteAllNotifications
};