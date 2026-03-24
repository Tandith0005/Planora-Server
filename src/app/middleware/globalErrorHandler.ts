import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError.js";
import { ZodError } from "zod";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = 500;
  let message = "Something went wrong";

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Prisma errors
  else if (err.code === "P2002") {
    statusCode = 400;
    message = "Duplicate field value";
  }

  // Zod errors
  else if (err instanceof ZodError || err.name === "ZodError") {
    statusCode = 400;
    // SAFE MAPPING: Check if errors array exists
    if (err.errors && Array.isArray(err.errors)) {
      message = err.errors.map((e: any) => e.message).join(", ");
    } else {
      message = "Validation failed";
    }
  }

  // JWT errors
  else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  // Custom errors
  else if (err.message) {
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
