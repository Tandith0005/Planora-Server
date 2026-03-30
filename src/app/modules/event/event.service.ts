import status from "http-status";
import { prisma } from "../../lib/prisma.js";
import AppError from "../../utils/AppError.js";
import { ICreateEvent } from "./event.interface.js";
import { Prisma } from "../../../generated/client/client.js";

const createEvent = async (userId: string, payload: ICreateEvent) => {
  return await prisma.event.create({
    data: {
      ...payload,
      creatorId: userId,
    },
  });
};

const getAllEvents = async (query: any) => {
  const {
    search,
    type,
    minFee,
    maxFee,
    page = 1,
    limit = 9,
    sortBy = "date",
    sortOrder = "asc",
  } = query;

  const pageNumber = Number(page) || 1;
  const limitNumber = Number(limit) || 9;
  const skip = (pageNumber - 1) * limitNumber;

  const whereCondition: Prisma.EventWhereInput = {};

  // SEARCH
  if (search) {
    whereCondition.OR = [
      {
        title: {
          contains: search,
          mode: "insensitive", // now properly typed
        },
      },
      {
        creator: {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
    ];
  }

  //  TYPE FILTER
  if (type) {
    whereCondition.type = type;
  }

  // FEE FILTER
  if (minFee || maxFee) {
    whereCondition.registrationFee = {};

    if (minFee) {
      whereCondition.registrationFee.gte = Number(minFee);
    }

    if (maxFee) {
      whereCondition.registrationFee.lte = Number(maxFee);
    }
  }

  const events = await prisma.event.findMany({
    where: whereCondition,
    skip,
    take: limitNumber,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      creator: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  const total = await prisma.event.count({
    where: whereCondition,
  });

  return {
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPage: Math.ceil(total / limitNumber),
    },
    data: events,
  };
};

const getSingleEvent = async (eventId: string) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      creator: true,
      participants: true,
    },
  });

  if (!event) {
    throw new AppError("Event not found", status.NOT_FOUND);
  }

  return event;
};

const getMyEvents = async (userId: string) => {
  return await prisma.event.findMany({
    where: { creatorId: userId },
  });
}

const updateEvent = async (
  userId: string,
  role: string,
  eventId: string,
  payload: any,
) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new AppError("Event not found", status.NOT_FOUND);
  }

  // OWNER CHECK
  if (event.creatorId !== userId && role !== "ADMIN") {
    throw new AppError("You are not allowed", status.FORBIDDEN);
  }

  return prisma.event.update({
    where: { id: eventId },
    data: payload,
  });
};

const deleteEvent = async (userId: string, role: string, eventId: string) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new AppError("Event not found", status.NOT_FOUND);
  }

  if (event.creatorId !== userId && role !== "ADMIN") {
    throw new AppError("You are not allowed", status.FORBIDDEN);
  }

  await prisma.event.delete({
    where: { id: eventId },
  });

  return null;
};

export const EventService = {
  createEvent,
  getAllEvents,
  getSingleEvent,
  getMyEvents,
  updateEvent,
  deleteEvent,
};
