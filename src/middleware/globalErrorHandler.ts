import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../utils/appError.js";

const globalErrorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const isInvalidJson = error instanceof SyntaxError
    && typeof error === "object"
    && "status" in error
    && error.status === StatusCodes.BAD_REQUEST;
  const statusCode = error instanceof AppError
    ? error.statusCode
    : isInvalidJson
      ? StatusCodes.BAD_REQUEST
      : StatusCodes.INTERNAL_SERVER_ERROR;
  const message = error instanceof AppError
    ? error.message
    : isInvalidJson
      ? "Invalid JSON body"
      : "Internal Server Error";
  const errors = error instanceof AppError && error.errors !== undefined
    ? error.errors
    : message;

  res.status(statusCode).json({ success: false, message, errors });
};

export default globalErrorHandler;
