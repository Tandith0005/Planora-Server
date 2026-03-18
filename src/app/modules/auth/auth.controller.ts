import { Request, Response } from "express";
import { AuthService } from "./auth.service.js";
import {
  loginValidationSchema,
  registerValidationSchema,
} from "./auth.validation.js";
import status from "http-status";

const registerUser = async (req: Request, res: Response) => {
  try {
    const validatedData = registerValidationSchema.parse(req.body);

    const result = await AuthService.registerUser(validatedData);

    res.status(status.CREATED).json({
      success: true,
      message:
        "User registered successfully. Please verify your email to login",
      data: result,
    });
  } catch (error: any) {
    res.status(status.BAD_REQUEST).json({
      success: false,
      message: error.errors || error.message,
    });
  }
};

const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    await AuthService.verifyEmail(token as string);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const loginUser = async (req: Request, res: Response) => {
  try {
    const validatedData = loginValidationSchema.parse(req.body);

    const result = await AuthService.loginUser(validatedData);

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: false, // true in production (HTTPS)
      sameSite: "lax",
    });
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: false, // true in production (HTTPS)
      sameSite: "lax",
    });

    res.status(status.OK).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error: any) {
    res.status(status.BAD_REQUEST).json({
      success: false,
      message: error.errors || error.message,
    });
  }
};

const refreshTokenHandler = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.refreshToken;

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
  } catch (err: any) {
    res.status(401).json({
      success: false,
      message: err.message,
    });
  }
};

const logoutUser = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.refreshToken;

    await AuthService.logoutUser(token);

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (err: any) {
    res.status(401).json({
      success: false,
      message: err.message,
    });
  }
};

export const AuthController = {
  registerUser,
  verifyEmail,
  loginUser,
  refreshTokenHandler,
  logoutUser
};
