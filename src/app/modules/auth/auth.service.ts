import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ILoginUser, IRegisterUser } from "./auth.interface.js";
import { prisma } from "../../lib/prisma.js";
import { envVars } from "../../../config/envVars.js";
import crypto from "crypto";
import { sendEmail } from "../../utils/sendEmail.js";

const registerUser = async (payload: IRegisterUser) => {
  const { name, email, password } = payload;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("User already exists");
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
    throw new Error("Invalid or expired token");
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
    throw new Error("User not found");
  }

  // SOFT DELETE CHECK
  if (user.isDeleted) {
    throw new Error("This user is deleted");
  }

  // EMAIL VERIFICATION CHECK
  if (!user.isVerified) {
    throw new Error("Please verify your email before logging in");
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new Error("Invalid credentials");
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
  };
};

const refreshToken = async (token: string) => {
  if (!token) throw new Error("No refresh token");

  const decoded = jwt.verify(token, envVars.JWT_REFRESH_SECRET) as any;

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user || user.refreshToken !== token) {
    throw new Error("Invalid refresh token");
  }

  // check expiry
  if (user.refreshTokenExpiry! < new Date()) {
    throw new Error("Refresh token expired, please login again");
  }

  // generate new tokens 
  const newAccessToken = jwt.sign(
    { userId: user.id, role: user.role },
    envVars.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const newRefreshToken = jwt.sign(
    { userId: user.id },
    envVars.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
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
  if (!token) throw new Error("No token provided");

  let decoded: any;

  try {
    decoded = jwt.verify(token, envVars.JWT_REFRESH_SECRET);
  } catch (err) {
    throw new Error("Invalid or expired token");
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
  registerUser,
  verifyEmail,
  loginUser,
  refreshToken,
  logoutUser
};
