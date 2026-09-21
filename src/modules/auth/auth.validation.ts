import { StatusCodes } from "http-status-codes";
import { USER_ROLES, type UserRole } from "../../types";
import { AppError } from "../../utils/appError";
import { rejectUnknownFields, requireRequestBody } from "../../utils/validation";
import type { LoginInput, SignupInput } from "./auth.interface";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const requiredText = (value: unknown, field: string): string => {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new AppError(StatusCodes.BAD_REQUEST, `${field} is required`);
  }
  return value.trim();
};

const parseEmail = (value: unknown): string => {
  const email = requiredText(value, "email").toLowerCase();
  if (!EMAIL_PATTERN.test(email)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "A valid email is required");
  }
  return email;
};

export const validateSignup = (value: unknown): SignupInput => {
  const body = requireRequestBody(value);
  rejectUnknownFields(body, ["name", "email", "password", "role"]);

  const password = requiredText(body.password, "password");
  if (password.length < 6) {
    throw new AppError(StatusCodes.BAD_REQUEST, "password must be at least 6 characters long");
  }

  const role = body.role ?? "contributor";
  if (typeof role !== "string" || !USER_ROLES.includes(role as UserRole)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "role must be contributor or maintainer");
  }

  return {
    name: requiredText(body.name, "name"),
    email: parseEmail(body.email),
    password,
    role: role as UserRole,
  };
};

export const validateLogin = (value: unknown): LoginInput => {
  const body = requireRequestBody(value);
  rejectUnknownFields(body, ["email", "password"]);
  return {
    email: parseEmail(body.email),
    password: requiredText(body.password, "password"),
  };
};
