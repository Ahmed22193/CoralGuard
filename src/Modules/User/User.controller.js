import { Router } from "express";
import upload from "../../Middlewares/Multer.js";
import * as UserService from './User.service.js';
import verifyToken from '../../Middlewares/VerifyingToken.js';
const router = Router();

router.post("/upload-image", verifyToken, upload.single("file"), UserService.uploadImage);
export default router;