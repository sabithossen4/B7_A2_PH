import type { ParsedQs } from "qs";
import { StatusCodes } from "http-status-codes";
import {
  ISSUE_STATUSES,
  ISSUE_TYPES,
  type IssueStatus,
  type IssueType,
} from "../../types/index.js";
import { AppError } from "../../utils/appError.js";
import { rejectUnknownFields, requireRequestBody } from "../../utils/validation.js";
import type { CreateIssueInput, IssueFilters, UpdateIssueInput } from "./issue.interface.js";

const parseTitle = (value: unknown): string => {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new AppError(StatusCodes.BAD_REQUEST, "title is required");
  }
  const title = value.trim();
  if (title.length > 150) {
    throw new AppError(StatusCodes.BAD_REQUEST, "title cannot exceed 150 characters");
  }
  return title;
};

const parseDescription = (value: unknown): string => {
  if (typeof value !== "string" || value.trim().length < 20) {
    throw new AppError(StatusCodes.BAD_REQUEST, "description must be at least 20 characters long");
  }
  return value.trim();
};

const parseType = (value: unknown): IssueType => {
  if (typeof value !== "string" || !ISSUE_TYPES.includes(value as IssueType)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "type must be bug or feature_request");
  }
  return value as IssueType;
};

const parseStatus = (value: unknown): IssueStatus => {
  if (typeof value !== "string" || !ISSUE_STATUSES.includes(value as IssueStatus)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "status must be open, in_progress, or resolved");
  }
  return value as IssueStatus;
};

export const validateCreateIssue = (value: unknown): CreateIssueInput => {
  const body = requireRequestBody(value);
  rejectUnknownFields(body, ["title", "description", "type"]);
  return {
    title: parseTitle(body.title),
    description: parseDescription(body.description),
    type: parseType(body.type),
  };
};

export const validateUpdateIssue = (value: unknown): UpdateIssueInput => {
  const body = requireRequestBody(value);
  rejectUnknownFields(body, ["title", "description", "type", "status"]);
  if (Object.keys(body).length === 0) {
    throw new AppError(StatusCodes.BAD_REQUEST, "At least one field is required to update an issue");
  }

  const result: UpdateIssueInput = {};
  if (body.title !== undefined) result.title = parseTitle(body.title);
  if (body.description !== undefined) result.description = parseDescription(body.description);
  if (body.type !== undefined) result.type = parseType(body.type);
  if (body.status !== undefined) result.status = parseStatus(body.status);
  return result;
};

const singleQueryValue = (value: undefined | string | ParsedQs | (string | ParsedQs)[]): string | undefined => {
  if (value === undefined) return undefined;
  if (typeof value !== "string") {
    throw new AppError(StatusCodes.BAD_REQUEST, "Query parameters must have a single value");
  }
  return value;
};

export const validateIssueFilters = (query: ParsedQs): IssueFilters => {
  rejectUnknownFields(query, ["sort", "type", "status"]);
  const sort = singleQueryValue(query.sort) ?? "newest";
  if (sort !== "newest" && sort !== "oldest") {
    throw new AppError(StatusCodes.BAD_REQUEST, "sort must be newest or oldest");
  }

  const typeValue = singleQueryValue(query.type);
  const statusValue = singleQueryValue(query.status);
  const filters: IssueFilters = { sort };
  if (typeValue !== undefined) filters.type = parseType(typeValue);
  if (statusValue !== undefined) filters.status = parseStatus(statusValue);
  return filters;
};
