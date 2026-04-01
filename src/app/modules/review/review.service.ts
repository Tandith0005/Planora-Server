import status from "http-status";
import { prisma } from "../../lib/prisma.js";
import AppError from "../../utils/AppError.js";

const createReview = async (userId: string, payload: any) => {
  const existing = await prisma.review.findUnique({
    where: { userId_eventId: { userId, eventId: payload.eventId } },
  });

  if (existing) {
    throw new AppError("You have already reviewed this event", status.CONFLICT);
  }

  const participant = await prisma.eventParticipant.findUnique({
    where: { userId_eventId: { userId, eventId: payload.eventId } },
  });

  return await prisma.review.create({
    data: {
      ...payload,
      userId,
      isParticipant: !!participant && participant.status === "APPROVED",
    },
    include: { user: { select: { name: true, email: true } } },
  });
};

const getEventReviews = async (eventId: string) => {
  const reviews = await prisma.review.findMany({
    where: { eventId },
    include: { user: { select: { name: true, email: true } } },
    orderBy: [{ isParticipant: "desc" }, { createdAt: "desc" }],
  });

  const total = reviews.length;
  const avg =
    total > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / total : 0;

  return { reviews, averageRating: parseFloat(avg.toFixed(1)), total };
};

const updateReview = async (userId: string, reviewId: string, payload: any) => {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });

  if (!review || review.userId !== userId) {
    throw new AppError("Review not found or unauthorized", status.FORBIDDEN);
  }

  const now = new Date();
  const createdAt = new Date(review.createdAt);
  const diffDays = Math.ceil(
    Math.abs(now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays > 7) {
    throw new AppError("Cannot edit review after 7 days", status.FORBIDDEN);
  }

  return await prisma.review.update({
    where: { id: reviewId },
    data: payload,
    include: { user: { select: { name: true } } },
  });
};

const deleteReview = async (userId: string, reviewId: string) => {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });

  if (!review || review.userId !== userId) {
    throw new AppError("Review not found or unauthorized", status.FORBIDDEN);
  }

  await prisma.review.delete({ where: { id: reviewId } });
  return { message: "Review deleted successfully" };
};

export const ReviewService = {
  createReview,
  getEventReviews,
  updateReview,
  deleteReview,
};
