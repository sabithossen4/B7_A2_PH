import { StatusCodes } from "http-status-codes";
import { AppError } from "./appError";

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const requireRequestBody = (value: unknown): Record<string, unknown> => {
  if (!isRecord(value)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Request body must be a JSON object");
  }
  return value;
};

export const parsePositiveInteger = (value: string, field = "id"): number => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new AppError(StatusCodes.BAD_REQUEST, `${field} must be a positive integer`);
  }
  return parsed;
};

export const rejectUnknownFields = (
  body: Record<string, unknown>,
  allowedFields: readonly string[],
): void => {
  const unknownFields = Object.keys(body).filter((key) => !allowedFields.includes(key));
  if (unknownFields.length > 0) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Request contains unsupported fields",
      { unknownFields },
    );
  }
};
