import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ILoginUser, IRegisterUser } from "./auth.interface.js";
import { prisma } from "../../lib/prisma.js";
import { envVars } from "../../../config/envVars.js";
import crypto from "crypto";
import { sendEmail } from "../../utils/sendEmail.js";
import AppError from "../../utils/AppError.js";
import status from "http-status";

const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isVerified: true,
      isDeleted: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", status.NOT_FOUND);
  };
  
  return user;
};
const registerUser = async (payload: IRegisterUser) => {
  const { name, email, password } = payload;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError("User already exists", status.CONFLICT);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // generate token
  const verificationToken = crypto.randomBytes(32).toString("hex");

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      verificationToken,
    },
  });

  // verification link -------------------------------------------------------------------------------------------------------------------
  const verifyLink = `${envVars.BASE_URL}/api/auth/verify-email?token=${verificationToken}`;

  await sendEmail(email, "Verify your email", "verifyEmail", { verifyLink });

  return {
    id: user.id,
    email: user.email,
  };
};

const verifyEmail = async (token: string) => {
  const user = await prisma.user.findFirst({
    where: { verificationToken: token },
  });

  if (!user) {
    throw new AppError("Invalid or expired token", status.BAD_REQUEST);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      verificationToken: null,
    },
  });

  return true;
};

const loginUser = async (payload: ILoginUser) => {
  const { email, password } = payload;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError("User not found", status.NOT_FOUND);
  }

  // SOFT DELETE CHECK
  if (user.isDeleted) {
    throw new AppError("This user is deleted", status.FORBIDDEN);
  }

  // EMAIL VERIFICATION CHECK
  if (!user.isVerified) {
    throw new AppError(
      "Please verify your email before logging in",
      status.FORBIDDEN,
    );
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new AppError("Invalid credentials", status.UNAUTHORIZED);
  }

  // JWT TOKENS ------------------------------------------------------------------------------
  const accessToken = jwt.sign(
    { userId: user.id, role: user.role },
    envVars.JWT_SECRET,
    { expiresIn: "15m" },
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    envVars.JWT_REFRESH_SECRET,
    { expiresIn: "7d" },
  );

  await prisma.user.update({
    where: { id: user.id },
    data: {
      refreshToken,
      refreshTokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    },
  };
};

const refreshToken = async (token: string) => {
  if (!token) throw new AppError("No refresh token", status.NOT_FOUND);

  const decoded = jwt.verify(token, envVars.JWT_REFRESH_SECRET) as any;

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user || user.refreshToken !== token) {
    throw new AppError("Invalid refresh token", status.UNAUTHORIZED);
  }

  // check expiry
  if (user.refreshTokenExpiry! < new Date()) {
    throw new AppError(
      "Refresh token expired, please login again",
      status.UNAUTHORIZED,
    );
  }

  // generate new tokens
  const newAccessToken = jwt.sign(
    { userId: user.id, role: user.role },
    envVars.JWT_SECRET,
    { expiresIn: "15m" },
  );

  const newRefreshToken = jwt.sign(
    { userId: user.id },
    envVars.JWT_REFRESH_SECRET,
    { expiresIn: "7d" },
  );

  // update DB
  await prisma.user.update({
    where: { id: user.id },
    data: {
      refreshToken: newRefreshToken,
      refreshTokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

const logoutUser = async (token: string) => {
  if (!token) throw new AppError("No token provided", status.NOT_FOUND);

  let decoded: any;

  try {
    decoded = jwt.verify(token, envVars.JWT_REFRESH_SECRET);
  } catch (err) {
    throw new AppError("Invalid or expired token", status.UNAUTHORIZED);
  }

  await prisma.user.update({
    where: { id: decoded.userId },
    data: {
      refreshToken: null,
      refreshTokenExpiry: null,
    },
  });
};

export const AuthService = {
  getMe,
  registerUser,
  verifyEmail,
  loginUser,
  refreshToken,
  logoutUser,
};
