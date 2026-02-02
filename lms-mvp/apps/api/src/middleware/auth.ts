import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/auth.js";
import { ApiError } from "../utils/errors.js";

export type AuthRequest = Request & { user?: { id: string; role: string } };

export function requireAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) {
    return next(new ApiError("Missing authorization", 401));
  }
  const [, token] = header.split(" ");
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch {
    return next(new ApiError("Invalid token", 401));
  }
}

export function requireRole(roles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError("Forbidden", 403));
    }
    return next();
  };
}
