import { Router } from "express";
import upload from "../../Middlewares/Multer.js";
import * as PatService from './Patient.service.js';
import verifyToken from '../../Middlewares/VerifyingToken.js';
const router = Router();


router.post("/createConsultation",verifyToken,upload.array("files", 5),PatService.createConsultation);
router.get("/MyConsultations", verifyToken, PatService.getMyConsultations);
router.patch("/PAID", verifyToken , PatService.PAID);
export default router;