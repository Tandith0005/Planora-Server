import { Request, Response } from "express";
import { ReviewService } from "./review.service.js";
import status from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";

const createReview = catchAsync(async (req: Request, res: Response) => {
  // const validated = createReviewSchema.parse(req.body);
  const result = await ReviewService.createReview(req.user!.userId, req.body);
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Review added",
    data: result,
  });
});

const getEventReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.getEventReviews(
    req.params.eventId as string,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Reviews fetched",
    data: result,
  });
});

const updateReview = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.updateReview(
    req.user!.userId,
    req.params.id as string,
    req.body,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Review updated",
    data: result,
  });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
  await ReviewService.deleteReview(req.user!.userId, req.params.id as string);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Review deleted",
    data: null,
  });
});

export const ReviewController = {
  createReview,
  getEventReviews,
  updateReview,
  deleteReview,
};
