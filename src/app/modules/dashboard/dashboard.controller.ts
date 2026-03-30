import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import status from "http-status";
import { sendResponse } from "../../utils/sendResponse.js";
import { DashboardService } from "./dashboard.service.js";

const getStats = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) throw new AppError("Unauthorized", status.UNAUTHORIZED);
  
  const result = await DashboardService.getStats(user.userId);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Stats fetched",
    data: result,
  });
});

const getAdminStats = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.getAdminStats();

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Stats fetched",
    data: result,
  });
});

export const DashboardController = { getStats, getAdminStats };
