import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import config from "../config";
import { USER_ROLES, type AuthUser, type UserRole } from "../types";
import { AppError } from "../utils/appError";

const isUserRole = (value: unknown): value is UserRole =>
  typeof value === "string" && USER_ROLES.some((role) => role === value);

const toAuthUser = (payload: string | JwtPayload): AuthUser => {
  if (
    typeof payload === "string"
    || typeof payload.id !== "number"
    || typeof payload.name !== "string"
    || !isUserRole(payload.role)
  ) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid JWT token");
  }
  return { id: payload.id, name: payload.name, role: payload.role };
};

const auth = (...allowedRoles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const authorization = req.headers.authorization;
      if (!authorization) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "JWT token is required");
      }

      const token = authorization.trim();
      if (!token) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "JWT token is required");
      }

      const user = toAuthUser(jwt.verify(token, config.jwtSecret));
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        throw new AppError(StatusCodes.FORBIDDEN, "You do not have permission to perform this action");
      }

      req.user = user;
      next();
    } catch (error: unknown) {
      if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
        next(new AppError(StatusCodes.UNAUTHORIZED, "Invalid or expired JWT token"));
        return;
      }
      next(error);
    }
  };

export default auth;
