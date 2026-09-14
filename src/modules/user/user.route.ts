import { Router } from "express";
import { userController } from "./user.controler";

const router = Router();

router.post('', userController.createUser);

export const userRoute = router; 