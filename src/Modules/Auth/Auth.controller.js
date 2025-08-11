import { Router } from "express";
import * as authService from './Auth.service.js';
const router = Router();

router.post('/signUp',authService.signUp);
router.post('/login',authService.login);

export default router;