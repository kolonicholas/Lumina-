import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import type { User } from "@prisma/client";

const accessSecret = process.env.JWT_ACCESS_SECRET ?? "dev-access";
const refreshSecret = process.env.JWT_REFRESH_SECRET ?? "dev-refresh";

export type TokenPayload = {
  sub: string;
  role: User["role"];
};

export function signAccessToken(payload: TokenPayload) {
  return jwt.sign(payload, accessSecret, { expiresIn: "15m" });
}

export function signRefreshToken(payload: TokenPayload) {
  return jwt.sign(payload, refreshSecret, { expiresIn: "7d", jwtid: nanoid() });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, accessSecret) as TokenPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, refreshSecret) as TokenPayload;
}
