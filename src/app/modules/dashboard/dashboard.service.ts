import { prisma } from "../../lib/prisma.js";

const getStats = async (userId: string) => {
  const now = new Date();

  const [
    myEvents,
    totalParticipants,
    upcomingEvents,
    pendingInvitations,
    unreadNotifications,
  ] = await Promise.all([
    // Total events I created
    prisma.event.count({ where: { creatorId: userId } }),

    // Total participants across all my events
    prisma.eventParticipant.count({
      where: { event: { creatorId: userId } },
    }),

    // My events that are in the future
    prisma.event.count({
      where: { creatorId: userId, date: { gte: now } },
    }),

    // Pending invitations I received
    prisma.invitation.count({
      where: { invitedUserId: userId, status: "PENDING" },
    }),

    // Unread notifications
    prisma.notification.count({
      where: { userId, isRead: false },
    }),
  ]);

  return {
    myEvents,
    totalParticipants,
    upcomingEvents,
    pendingInvitations,
    unreadNotifications,
  };
};

const getAdminStats = async () => {
  const [
    totalUsers,
    totalEvents,
    publicEvents,
    privateEvents,
    recentUsers,
    recentEvents,
  ] = await Promise.all([
    prisma.user.count({ where: { isDeleted: false } }),
    prisma.event.count(),
    prisma.event.count({ where: { type: "PUBLIC" } }),
    prisma.event.count({ where: { type: "PRIVATE" } }),
    prisma.user.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, role: true },
    }),
    prisma.event.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, type: true, date: true },
    }),
  ]);

  return {
    totalUsers,
    totalEvents,
    publicEvents,
    privateEvents,
    recentUsers,
    recentEvents,
  };
};

export const DashboardService = { getStats, getAdminStats };
