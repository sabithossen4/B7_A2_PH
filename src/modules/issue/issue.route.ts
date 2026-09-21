import { Router } from "express";
import auth from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { issueController } from "./issue.controller";

const router = Router();

router.get("/", asyncHandler(issueController.getAllIssues));
router.get("/:id", asyncHandler(issueController.getSingleIssue));
router.post("/", auth("contributor", "maintainer"), asyncHandler(issueController.createIssue));
router.patch("/:id", auth("contributor", "maintainer"), asyncHandler(issueController.updateIssue));
router.delete("/:id", auth("maintainer"), asyncHandler(issueController.deleteIssue));

export const issueRouter = router;
