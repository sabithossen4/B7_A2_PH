import { Router } from "express";
import { userController } from "./user.controler";
import auth from "../../middleware/auth";

const router = Router();



router.post('', userController.createUser);
router.get('', auth(), userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUserById); 
router.delete('/:id', userController.deleteUserById);

export const userRoute = router;  