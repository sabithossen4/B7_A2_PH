import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../../utils/appError.js";
import { sendSuccess } from "../../utils/response.js";
import { parsePositiveInteger } from "../../utils/validation.js";
import { issueService } from "./issue.service.js";
import {
  validateCreateIssue,
  validateIssueFilters,
  validateUpdateIssue,
} from "./issue.validation.js";

const authenticatedUser = (req: Request) => {
  if (!req.user) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Authentication is required");
  }
  return req.user;
};

const issueId = (req: Request): number => {
  const id = req.params.id;
  if (typeof id !== "string") {
    throw new AppError(StatusCodes.BAD_REQUEST, "id must be a positive integer");
  }
  return parsePositiveInteger(id);
};

const createIssue = async (req: Request, res: Response): Promise<Response> => {
  const user = authenticatedUser(req);
  const issue = await issueService.createIssue(validateCreateIssue(req.body), user.id);
  return sendSuccess(res, StatusCodes.CREATED, "Issue created successfully", issue);
};

const getAllIssues = async (req: Request, res: Response): Promise<Response> => {
  const issues = await issueService.getAllIssues(validateIssueFilters(req.query));
  return sendSuccess(res, StatusCodes.OK, "Issues retrived successfully", issues);
};

const getSingleIssue = async (req: Request, res: Response): Promise<Response> => {
  const issue = await issueService.getSingleIssue(issueId(req));
  return sendSuccess(res, StatusCodes.OK, "Issue retrived successfully", issue);
};

const updateIssue = async (req: Request, res: Response): Promise<Response> => {
  const user = authenticatedUser(req);
  const issue = await issueService.updateIssue(
    issueId(req),
    validateUpdateIssue(req.body),
    user,
  );
  return sendSuccess(res, StatusCodes.OK, "Issue updated successfully", issue);
};

const deleteIssue = async (req: Request, res: Response): Promise<Response> => {
  await issueService.deleteIssue(issueId(req));
  return sendSuccess(res, StatusCodes.OK, "Issue deleted successfully");
};

export const issueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue,
};
