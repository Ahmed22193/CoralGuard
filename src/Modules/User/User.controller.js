import { Router } from "express";
import upload from "../../Middlewares/Multer.js";
import * as UserService from './User.service.js';
import verifyToken from '../../Middlewares/VerifyingToken.js';

const router = Router();

// Image management routes
router.post("/upload-image", verifyToken, upload.single("file"), UserService.uploadImage);
router.get("/images", verifyToken, UserService.getImages);
router.get("/images/:id", verifyToken, UserService.getImageById);
router.post("/images/:id/analyze", verifyToken, UserService.analyzeImage);
router.delete("/images/:id", verifyToken, UserService.deleteImage);

// User profile routes
router.get("/profile", verifyToken, UserService.getUserProfile);
router.put("/profile", verifyToken, UserService.updateUserProfile);

export default router;