import { Request, Response } from "express";
import { AuthService } from "./auth.service.js";
import {
  loginValidationSchema,
  registerValidationSchema,
} from "./auth.validation.js";
import status from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const validatedData = registerValidationSchema.parse(req.body);

  const result = await AuthService.registerUser(validatedData);

  res.status(status.CREATED).json({
    success: true,
    message:
      "User registered successfully. Please verify your email to login",
    data: result,
  });
});

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const { token } = req.query;

  if (!token) {
    throw new AppError("Token is required", status.BAD_REQUEST);
  }

  await AuthService.verifyEmail(token as string);

  res.status(status.OK).json({
    success: true,
    message: "Email verified successfully",
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const validatedData = loginValidationSchema.parse(req.body);

  const result = await AuthService.loginUser(validatedData);

  res.cookie("accessToken", result.accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  res.status(status.OK).json({
    success: true,
    message: "Login successful",
    data: result,
  });
});

const refreshTokenHandler = catchAsync(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    throw new AppError("No refresh token provided", status.UNAUTHORIZED);
  }

  const result = await AuthService.refreshToken(token);

  res.cookie("accessToken", result.accessToken, {
    httpOnly: true,
  });

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
  });

  res.json({
    success: true,
    message: "Token refreshed",
  });
});

const logoutUser = catchAsync(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    throw new AppError("No token provided", status.NOT_FOUND);
  }

  await AuthService.logoutUser(token);

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  res.json({
    success: true,
    message: "Logout successful",
  });
});

export const AuthController = {
  registerUser,
  verifyEmail,
  loginUser,
  refreshTokenHandler,
  logoutUser
};
