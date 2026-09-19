import { Router } from "express";
import { userController } from "./user.controler";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../../types/index";

const router = Router();

 



router.post('', userController.createUser);
router.get('', auth(USER_ROLE.admin, USER_ROLE.agent, USER_ROLE.user), userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUserById); 
router.delete('/:id', userController.deleteUserById);

export const userRoute = router;  