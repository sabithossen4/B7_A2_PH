import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { sendSuccess } from "../../utils/response.js";
import { authService } from "./auth.service.js";
import { validateLogin, validateSignup } from "./auth.validation.js";

const signup = async (req: Request, res: Response): Promise<Response> => {
  const user = await authService.signup(validateSignup(req.body));
  return sendSuccess(res, StatusCodes.CREATED, "User registered successfully", user);
};

const login = async (req: Request, res: Response): Promise<Response> => {
  const result = await authService.login(validateLogin(req.body));
  return sendSuccess(res, StatusCodes.OK, "Login successful", result);
};

export const authController = { signup, login };
