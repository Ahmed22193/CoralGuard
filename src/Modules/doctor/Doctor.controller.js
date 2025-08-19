import { Router } from "express";
import * as docService from "./Doctor.service.js";
import verifyToken from "../../Middlewares/VerifyingToken.js";
import upload from "../../Middlewares/Multer.js";
const router = Router();

router.get("/Doctors", docService.Doctors);
router.get("/ConsultationsOrders", verifyToken, docService.ConsultationsOrders);
router.patch(
  "/updateConsultationStatus",
  verifyToken,
  docService.updateConsultationStatus
);
router.patch("/Report", verifyToken, docService.Report);
router.post("/addReport", verifyToken, upload.single("file"), docService.addReport);
export default router;
