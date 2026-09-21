import { StatusCodes } from "http-status-codes";
import { pool } from "../../db";
import type { AuthUser, IssueStatus, IssueType } from "../../types";
import { AppError } from "../../utils/appError";
import type {
  CreateIssueInput,
  IssueFilters,
  IssueResponse,
  IssueRow,
  Reporter,
  UpdateIssueInput,
} from "./issue.interface";

const findIssueRow = async (id: number): Promise<IssueRow> => {
  const result = await pool.query<IssueRow>(`
    SELECT id, title, description, type, status, reporter_id, created_at, updated_at
    FROM devpulse.issues
    WHERE id = $1
  `, [id]);
  const issue = result.rows[0];
  if (!issue) {
    throw new AppError(StatusCodes.NOT_FOUND, "Issue not found");
  }
  return issue;
};

const attachReporters = async (issues: IssueRow[]): Promise<IssueResponse[]> => {
  if (issues.length === 0) return [];

  const reporterIds = [...new Set(issues.map((issue) => issue.reporter_id))];
  const result = await pool.query<Reporter>(`
    SELECT id, name, role
    FROM devpulse.users
    WHERE id = ANY($1::int[])
  `, [reporterIds]);
  const reporters = new Map(result.rows.map((reporter) => [reporter.id, reporter]));

  return issues.map(({ reporter_id, ...issue }) => {
    const reporter = reporters.get(reporter_id);
    if (!reporter) {
      throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, "Issue reporter could not be found");
    }
    return { ...issue, reporter };
  });
};

const createIssue = async (payload: CreateIssueInput, reporterId: number): Promise<IssueRow> => {
  const result = await pool.query<IssueRow>(`
    INSERT INTO devpulse.issues (title, description, type, reporter_id)
    VALUES ($1, $2, $3, $4)
    RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
  `, [payload.title, payload.description, payload.type, reporterId]);
  const issue = result.rows[0];
  if (!issue) {
    throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, "Could not create issue");
  }
  return issue;
};

const getAllIssues = async (filters: IssueFilters): Promise<IssueResponse[]> => {
  const conditions: string[] = [];
  const values: (IssueType | IssueStatus)[] = [];

  if (filters.type) {
    values.push(filters.type);
    conditions.push(`type = $${values.length}`);
  }
  if (filters.status) {
    values.push(filters.status);
    conditions.push(`status = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const sortDirection = filters.sort === "oldest" ? "ASC" : "DESC";
  const result = await pool.query<IssueRow>(`
    SELECT id, title, description, type, status, reporter_id, created_at, updated_at
    FROM devpulse.issues
    ${whereClause}
    ORDER BY created_at ${sortDirection}
  `, values);
  return attachReporters(result.rows);
};

const getSingleIssue = async (id: number): Promise<IssueResponse> => {
  const [issue] = await attachReporters([await findIssueRow(id)]);
  if (!issue) {
    throw new AppError(StatusCodes.NOT_FOUND, "Issue not found");
  }
  return issue;
};

const updateIssue = async (
  id: number,
  payload: UpdateIssueInput,
  requester: AuthUser,
): Promise<IssueRow> => {
  const existingIssue = await findIssueRow(id);
  if (requester.role === "contributor") {
    if (existingIssue.reporter_id !== requester.id) {
      throw new AppError(StatusCodes.FORBIDDEN, "Contributors can only update their own issues");
    }
    if (existingIssue.status !== "open") {
      throw new AppError(StatusCodes.CONFLICT, "Only open issues can be updated by contributors");
    }
    if (payload.status !== undefined) {
      throw new AppError(StatusCodes.FORBIDDEN, "Only maintainers can change issue status");
    }
  }

  const entries = Object.entries(payload) as [keyof UpdateIssueInput, string][];
  const values = entries.map(([, value]) => value);
  const assignments = entries.map(([field], index) => `${field} = $${index + 1}`);
  values.push(String(id));

  const result = await pool.query<IssueRow>(`
    UPDATE devpulse.issues
    SET ${assignments.join(", ")}
    WHERE id = $${values.length}
    RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
  `, values);
  const issue = result.rows[0];
  if (!issue) {
    throw new AppError(StatusCodes.NOT_FOUND, "Issue not found");
  }
  return issue;
};

const deleteIssue = async (id: number): Promise<void> => {
  const result = await pool.query<{ id: number }>(`
    DELETE FROM devpulse.issues WHERE id = $1 RETURNING id
  `, [id]);
  if (!result.rows[0]) {
    throw new AppError(StatusCodes.NOT_FOUND, "Issue not found");
  }
};

export const issueService = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue,
};
