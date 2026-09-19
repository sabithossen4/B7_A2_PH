import { Router } from "express";
import { authControler } from "./auth controler";

const router = Router();

router.post('/login', authControler.loginUser);
router.post('/refresh-token', authControler.refreshToken);

export const authRouter = router; 