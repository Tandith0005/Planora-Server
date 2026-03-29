import status from "http-status";
import { prisma } from "../../lib/prisma.js";
import AppError from "../../utils/AppError.js";

// -------------------------------------------- this is not used from here, go to utils/createNotification for that
// const createNotification = async (payload: ICreateNotification) => {
//   return prisma.notification.create({
//     data: payload,
//   });
// }; ------------------------------------------ this is not used from here, go to utils/createNotification for that

// Get My Notifications
const getMyNotifications = async (userId: string, query: any) => {
  const { page = 1, limit = 10 } = query;

  const pageNumber = Number(page) || 1;
  const limitNumber = Number(limit) || 10;

  const skip = (pageNumber - 1) * limitNumber;

  const notifications = await prisma.notification.findMany({
    where: { userId },
    skip,
    take: limitNumber,
    orderBy: {
      createdAt: "desc",
    },
  });

  const total = await prisma.notification.count({
    where: { userId },
  });

  return {
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPage: Math.ceil(total / limitNumber),
    },
    data: notifications,
  };
};

// Mark single as read
const markAsRead = async (userId: string, id: string) => {
  const result = await prisma.notification.updateMany({
    where: {
      id,
      userId,
    },
    data: {
      isRead: true,
    },
  });

  if (result.count === 0) {
    throw new AppError("Notification not found", status.NOT_FOUND);
  }

  return { message: "Marked as read" };
};

// Mark all as read
const markAllAsRead = async (userId: string) => {
  await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });

  return { message: "All notifications marked as read" };
};

// Delete all notifications
const deleteAllNotifications = async (userId: string) => {
  await prisma.notification.deleteMany({
    where: {
      userId,
    },
  });

  return { message: "All notifications deleted" };
};

export const NotificationService = {
  // createNotification,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteAllNotifications,
};