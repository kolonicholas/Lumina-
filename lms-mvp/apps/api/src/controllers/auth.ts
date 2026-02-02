import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { loginSchema, registerSchema, resetPasswordSchema } from "@lms/shared";
import { prisma } from "../utils/db.js";
import { ApiError } from "../utils/errors.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/auth.js";

const refreshCookieName = "lms_refresh";

function setRefreshCookie(res: Response, token: string) {
  res.cookie(refreshCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export async function register(req: Request, res: Response) {
  const data = registerSchema.parse(req.body);
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new ApiError("Email already registered", 400);
  }
  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      role: "STUDENT",
    },
  });
  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = signRefreshToken({ sub: user.id, role: user.role });
  await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });
  setRefreshCookie(res, refreshToken);
  return res.json({ accessToken, user: { id: user.id, name: user.name, role: user.role } });
}

export async function login(req: Request, res: Response) {
  const data = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) {
    throw new ApiError("Invalid credentials", 401);
  }
  if (user.status === "SUSPENDED") {
    throw new ApiError("Account suspended", 403);
  }
  const isValid = await bcrypt.compare(data.password, user.passwordHash);
  if (!isValid) {
    throw new ApiError("Invalid credentials", 401);
  }
  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = signRefreshToken({ sub: user.id, role: user.role });
  await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });
  setRefreshCookie(res, refreshToken);
  return res.json({ accessToken, user: { id: user.id, name: user.name, role: user.role } });
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies[refreshCookieName];
  if (!token) {
    throw new ApiError("Missing refresh token", 401);
  }
  const payload = verifyRefreshToken(token);
  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || user.refreshToken !== token) {
    throw new ApiError("Invalid refresh token", 401);
  }
  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = signRefreshToken({ sub: user.id, role: user.role });
  await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });
  setRefreshCookie(res, refreshToken);
  return res.json({ accessToken });
}

export async function logout(req: Request, res: Response) {
  const token = req.cookies[refreshCookieName];
  if (token) {
    const payload = verifyRefreshToken(token);
    await prisma.user.update({ where: { id: payload.sub }, data: { refreshToken: null } });
  }
  res.clearCookie(refreshCookieName);
  return res.json({ success: true });
}

export async function forgotPassword(req: Request, res: Response) {
  const email = req.body.email as string;
  if (!email) {
    throw new ApiError("Email required", 400);
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.json({ success: true });
  }
  const token = nanoid(32);
  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken: token, resetTokenAt: new Date() },
  });
  console.log(`Password reset token for ${email}: ${token}`);
  return res.json({ success: true });
}

export async function resetPassword(req: Request, res: Response) {
  const data = resetPasswordSchema.parse(req.body);
  const user = await prisma.user.findFirst({ where: { resetToken: data.token } });
  if (!user || !user.resetTokenAt) {
    throw new ApiError("Invalid reset token", 400);
  }
  const ageMinutes = (Date.now() - user.resetTokenAt.getTime()) / 1000 / 60;
  if (ageMinutes > 60) {
    throw new ApiError("Reset token expired", 400);
  }
  const passwordHash = await bcrypt.hash(data.password, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetToken: null, resetTokenAt: null },
  });
  return res.json({ success: true });
}
