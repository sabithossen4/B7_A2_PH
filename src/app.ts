import express, { type Application, type Request, type Response } from "express";
import cors from "cors";
import { StatusCodes } from "http-status-codes";
import config from "./config";
import globalErrorHandler from "./middleware/globalErrorHandler";
import { authRouter } from "./modules/auth/auth.route";
import { issueRouter } from "./modules/issue/issue.route";
import { AppError } from "./utils/appError";

const app: Application = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({
    success: true,
    message: "DevPulse API is running",
  });
});

app.use("/api/auth", authRouter);
app.use("/api/issues", issueRouter);

app.use((_req: Request, _res: Response, next) => {
  next(new AppError(StatusCodes.NOT_FOUND, "Route not found"));
});

app.use(globalErrorHandler);

export default app;
