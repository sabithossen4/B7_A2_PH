import { Router } from 'express';
import {profileController} from './profile.controler';

const router = Router();

router.post('/', profileController.createProfile); 

export const profileRoute = router;