import express from "express";
import { AdminController } from "./Admin.controller.js";
import { VerifyingAdminToken } from "../../Middlewares/VerifyingAdminToken.js";
import { adminPermissionCheck } from "../../Middlewares/AdminPermissionCheck.js";

const adminRouter = express.Router();

// Authentication Routes
adminRouter.post("/auth/login", AdminController.adminLogin);
adminRouter.post("/auth/logout", VerifyingAdminToken, AdminController.adminLogout);

// Admin Management Routes (Super Admin / Admin with user_management permission)
adminRouter.post("/register", 
  VerifyingAdminToken, 
  adminPermissionCheck(['user_management']), 
  AdminController.adminRegister
);

adminRouter.get("/", 
  VerifyingAdminToken, 
  adminPermissionCheck(['user_management']), 
  AdminController.getAllAdmins
);

adminRouter.get("/:adminId", 
  VerifyingAdminToken, 
  adminPermissionCheck(['user_management']), 
  AdminController.getAdminById
);

adminRouter.put("/:adminId", 
  VerifyingAdminToken, 
  adminPermissionCheck(['user_management']), 
  AdminController.updateAdmin
);

adminRouter.delete("/:adminId", 
  VerifyingAdminToken, 
  adminPermissionCheck(['user_management']), 
  AdminController.deleteAdmin
);

adminRouter.patch("/:adminId/status", 
  VerifyingAdminToken, 
  adminPermissionCheck(['user_management']), 
  AdminController.changeAdminStatus
);

// Dashboard Routes
adminRouter.get("/dashboard/overview", 
  VerifyingAdminToken, 
  AdminController.getDashboard
);

adminRouter.get("/dashboard/analytics", 
  VerifyingAdminToken, 
  adminPermissionCheck(['analytics_view']), 
  AdminController.getAnalytics
);

// User Management Routes
adminRouter.get("/users/list", 
  VerifyingAdminToken, 
  adminPermissionCheck(['user_management']), 
  AdminController.getAllUsers
);

adminRouter.get("/users/:userId", 
  VerifyingAdminToken, 
  adminPermissionCheck(['user_management']), 
  AdminController.getUserDetails
);

adminRouter.patch("/users/:userId/status", 
  VerifyingAdminToken, 
  adminPermissionCheck(['user_management']), 
  AdminController.updateUserStatus
);

adminRouter.delete("/users/:userId", 
  VerifyingAdminToken, 
  adminPermissionCheck(['user_management']), 
  AdminController.deleteUser
);

// Content Moderation Routes
adminRouter.get("/content/moderation", 
  VerifyingAdminToken, 
  adminPermissionCheck(['content_moderation']), 
  AdminController.getContentForModeration
);

adminRouter.post("/content/:contentId/moderate", 
  VerifyingAdminToken, 
  adminPermissionCheck(['content_moderation']), 
  AdminController.moderateContent
);

// System Settings Routes
adminRouter.get("/settings", 
  VerifyingAdminToken, 
  adminPermissionCheck(['system_settings']), 
  AdminController.getSystemSettings
);

adminRouter.put("/settings", 
  VerifyingAdminToken, 
  adminPermissionCheck(['system_settings']), 
  AdminController.updateSystemSetting
);

// Activity Log Routes
adminRouter.get("/logs/activity", 
  VerifyingAdminToken, 
  adminPermissionCheck(['security_management']), 
  AdminController.getActivityLogs
);

// Profile Management Routes
adminRouter.get("/profile", 
  VerifyingAdminToken, 
  AdminController.getAdminProfile
);

adminRouter.put("/profile", 
  VerifyingAdminToken, 
  AdminController.updateAdminProfile
);

adminRouter.post("/profile/change-password", 
  VerifyingAdminToken, 
  AdminController.changeAdminPassword
);

// User Role Management Routes
adminRouter.post("/users/:userId/change-role", 
  VerifyingAdminToken, 
  adminPermissionCheck(['user_management']), 
  AdminController.changeUserRole
);

adminRouter.post("/users/bulk-change-roles", 
  VerifyingAdminToken, 
  adminPermissionCheck(['user_management']), 
  AdminController.bulkChangeUserRoles
);

adminRouter.get("/users/:userId/role-history", 
  VerifyingAdminToken, 
  adminPermissionCheck(['user_management']), 
  AdminController.getUserRoleHistory
);

adminRouter.get("/users/role-history", 
  VerifyingAdminToken, 
  adminPermissionCheck(['user_management']), 
  AdminController.getAllRoleHistory
);

adminRouter.get("/users/by-role/:role", 
  VerifyingAdminToken, 
  adminPermissionCheck(['user_management']), 
  AdminController.getUsersByRole
);

adminRouter.get("/users/role-stats", 
  VerifyingAdminToken, 
  adminPermissionCheck(['analytics_view']), 
  AdminController.getUserRoleStats
);

adminRouter.get("/users/role-templates", 
  VerifyingAdminToken, 
  AdminController.getRoleTemplates
);

adminRouter.put("/users/:userId/subscription", 
  VerifyingAdminToken, 
  adminPermissionCheck(['user_management']), 
  AdminController.updateUserSubscription
);

export default adminRouter;
