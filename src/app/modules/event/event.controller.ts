import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { EventService } from "./event.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import status from "http-status";
import AppError from "../../utils/AppError.js";

const createEvent = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new AppError("Unauthorized: No user found", status.UNAUTHORIZED);
  }

  const result = await EventService.createEvent(user.userId, req.body);

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Event created successfully",
    data: result,
  });
});

const getAllEvents = catchAsync(async (req: Request, res: Response) => {
  const result = await EventService.getAllEvents(req.query);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Events fetched successfully",
    data: result,
    meta: result.meta
  });
});

const getMyEvents = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new AppError("Unauthorized: No user found", status.UNAUTHORIZED);
  }

  const result = await EventService.getMyEvents(user.userId);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Events fetched successfully",
    data: result
  });
});

const getSingleEvent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await EventService.getSingleEvent(id as string);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Event fetched successfully",
    data: result,
  });
});

const updateEvent = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const { id } = req.params;

  if (!user) {
    throw new AppError("Unauthorized: No user found", status.UNAUTHORIZED);
  }

  const result = await EventService.updateEvent(
    user.userId,
    user.role,
    id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Event updated successfully",
    data: result,
  });
});

const deleteEvent = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const { id } = req.params as { id: string };

  if (!user) {
    throw new AppError("Unauthorized: No user found", status.UNAUTHORIZED);
  }

  await EventService.deleteEvent(user.userId, user.role, id);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Event deleted successfully",
    data: null,
  });
});

export const EventController = {
  createEvent,
  getAllEvents,
  getMyEvents,
  getSingleEvent,
  updateEvent,
  deleteEvent,
};
