import { Request, Response } from "express";
import { AuthService } from "./auth.service.js";
import {
  loginValidationSchema,
  registerValidationSchema,
} from "./auth.validation.js";
import status from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";

const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new AppError("User not authenticated", status.UNAUTHORIZED);
  }

  const result = await AuthService.getMe(user.userId);

  res.status(status.OK).json({
    success: true,
    message: "User fetched successfully",
    data: result,
  });
});

const updateMe = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new AppError("User not authenticated", status.UNAUTHORIZED);
  }

  const result = await AuthService.updateMe(user.userId, req.body);

  res.status(status.OK).json({
    success: true,
    message: "User updated successfully",
    data: result,
  });
});

const searchUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.searchUsers(req.query);

  res.status(status.OK).json({
    success: true,
    message: "Users fetched successfully",
    data: result,
  });
});

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const validatedData = registerValidationSchema.parse(req.body);

  const result = await AuthService.registerUser(validatedData);

  res.status(status.CREATED).json({
    success: true,
    message: "User registered successfully. Please verify your email to login",
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
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("accessToken", result.accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 15 * 60 * 1000, // 15 mins
  });

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("accessToken", result.accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 15 * 60 * 1000, // 15 mins
  });

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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

  const isProduction = process.env.NODE_ENV === "production";

  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });

  res.json({
    success: true,
    message: "Logout successful",
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new AppError("User not authenticated", status.UNAUTHORIZED);
  }

  const result = await AuthService.deleteUser(user.userId);

  res.status(status.OK).json({
    success: true,
    message: "User deleted successfully",
    data: result,
  });
});

const adminDeleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await AuthService.adminDeleteUser(id as string);

  res.status(status.OK).json({
    success: true,
    message: "User deleted successfully",
    data: result,
  });
});

export const AuthController = {
  getMe,
  updateMe,
  searchUsers,
  registerUser,
  verifyEmail,
  loginUser,
  refreshTokenHandler,
  logoutUser,
  deleteUser,
  adminDeleteUser,
};
