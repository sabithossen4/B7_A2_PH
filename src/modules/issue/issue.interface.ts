import type { IssueStatus, IssueType, UserRole } from "../../types/index.js";

export interface IssueRow {
  id: number;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  reporter_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface Reporter {
  id: number;
  name: string;
  role: UserRole;
}

export type IssueResponse = Omit<IssueRow, "reporter_id"> & {
  reporter: Reporter;
};

export interface CreateIssueInput {
  title: string;
  description: string;
  type: IssueType;
}

export interface UpdateIssueInput {
  title?: string;
  description?: string;
  type?: IssueType;
  status?: IssueStatus;
}

export interface IssueFilters {
  sort: "newest" | "oldest";
  type?: IssueType;
  status?: IssueStatus;
}
