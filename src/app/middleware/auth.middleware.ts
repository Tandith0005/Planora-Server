import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { envVars } from "../../config/envVars.js";
import AppError from "../utils/AppError.js";
import status from "http-status";
import { Role } from "../../generated/client/enums.js";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // const token = req.cookies.accessToken;
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : req.cookies?.accessToken;

    if (!token) {
      throw new AppError(
        "Unauthorized: No token provided",
        status.UNAUTHORIZED,
      );
    }

    const decoded = jwt.verify(token, envVars.JWT_SECRET) as {
      userId: string;
      role: Role;
    };
    if (!Object.values(Role).includes(decoded.role)) {
      throw new AppError("Invalid role", status.UNAUTHORIZED);
    }

    // attach user info in request
    req.user = { userId: decoded.userId, role: decoded.role };;

    next();
  } catch (error) {
    next(
      new AppError(
        "Unauthorized: Invalid or expired token",
        status.UNAUTHORIZED,
      ),
    );
  }
};
