import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authController } from "./auth.controller.js";

const router = Router();

router.post("/signup", asyncHandler(authController.signup));
router.post("/login", asyncHandler(authController.login));

export const authRouter = router;
