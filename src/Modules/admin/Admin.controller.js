import { Router } from "express";
import isAdmin from "../../Middlewares/isAdmin.js";
import verifyToken from "../../Middlewares/VerifyingToken.js";
import * as adminService from "./Admin.service.js";
const router = Router();

router.patch("/UpdateDoctor", verifyToken, isAdmin, adminService.UpdateDoctor);
router.get(
  "/doctorsRegistration",
  verifyToken,
  isAdmin,
  adminService.doctorsRegistration
);
router.delete("/deleteUser", verifyToken, isAdmin, adminService.deleteUser);
router.delete(
  "/deleteConsultation",
  verifyToken,
  isAdmin,
  adminService.deleteConsultation
);
router.get("/getStats", verifyToken, isAdmin, adminService.getStats);
router.get("/getAllUsers", verifyToken, isAdmin, adminService.getAllUsers);
router.get(
  "/getAllConsultations",
  verifyToken,
  isAdmin,
  adminService.getAllConsultations
);

export default router;
