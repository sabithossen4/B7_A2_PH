import { Router } from "express";
import { authControler } from "./auth controler";

const router = Router();

router.post('/login', authControler.loginUser);

export const authRouter = router; 