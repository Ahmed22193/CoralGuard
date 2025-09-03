import { AdminService } from "./Admin.service.js";
import { AdminDTOMapper } from "../../DTOs/Admin/AdminDTOMapper.js";
import { SuccessfulRes } from "../../Utils/SuccessfulRes.js";
import { globalError } from "../../Utils/gloabelError.js";

export class AdminController {
  
  // Authentication Controllers
  static async adminLogin(req, res, next) {
    try {
      const credentials = AdminDTOMapper.mapLoginRequestToCredentials(req.body);
      const result = await AdminService.login(credentials, req);
      
      const response = SuccessfulRes("Admin login successful", result);
      res.status(200).json(response);
    } catch (error) {
      next(globalError(error.message, 401));
    }
  }

  static async adminRegister(req, res, next) {
    try {
      const adminData = AdminDTOMapper.mapRegisterRequestToModel(req.body);
      adminData.createdBy = req.admin?.id; // Set creator admin
      
      const result = await AdminService.register(adminData, req);
      
      const response = SuccessfulRes("Admin registered successfully", result);
      res.status(201).json(response);
    } catch (error) {
      next(globalError(error.message, 400));
    }
  }

  static async adminLogout(req, res, next) {
    try {
      await AdminService.logout(req.admin.id, req);
      
      const response = SuccessfulRes("Admin logout successful");
      res.status(200).json(response);
    } catch (error) {
      next(globalError(error.message, 400));
    }
  }

  // Admin Management Controllers
  static async getAllAdmins(req, res, next) {
    try {
      const { page = 1, limit = 10, role, isActive, search } = req.query;
      const filters = { role, isActive, search };
      
      const result = await AdminService.getAllAdmins({ page, limit, filters });
      
      const response = SuccessfulRes("Admins retrieved successfully", result);
      res.status(200).json(response);
    } catch (error) {
      next(globalError(error.message, 400));
    }
  }

  static async getAdminById(req, res, next) {
    try {
      const { adminId } = req.params;
      const result = await AdminService.getAdminById(adminId);
      
      const response = SuccessfulRes("Admin retrieved successfully", result);
      res.status(200).json(response);
    } catch (error) {
      next(globalError(error.message, 404));
    }
  }

  static async updateAdmin(req, res, next) {
    try {
      const { adminId } = req.params;
      const updateData = AdminDTOMapper.mapUpdateRequestToModel(req.body);
      
      const result = await AdminService.updateAdmin(adminId, updateData, req);
      
      const response = SuccessfulRes("Admin updated successfully", result);
      res.status(200).json(response);
    } catch (error) {
      next(globalError(error.message, 400));
    }
  }

  static async deleteAdmin(req, res, next) {
    try {
      const { adminId } = req.params;
      await AdminService.deleteAdmin(adminId, req);
      
      const response = SuccessfulRes("Admin deleted successfully");
      res.status(200).json(response);
    } catch (error) {
      next(globalError(error.message, 400));
    }
  }

  static async changeAdminStatus(req, res, next) {
    try {
      const { adminId } = req.params;
      const { isActive } = req.body;
      
      const result = await AdminService.changeAdminStatus(adminId, isActive, req);
      
      const response = SuccessfulRes("Admin status updated successfully", result);
      res.status(200).json(response);
    } catch (error) {
      next(globalError(error.message, 400));
    }
  }

  // Dashboard Controllers
  static async getDashboard(req, res, next) {
    try {
      const result = await AdminService.getDashboardData();
      
      const response = SuccessfulRes("Dashboard data retrieved successfully", result);
      res.status(200).json(response);
    } catch (error) {
      next(globalError(error.message, 400));
    }
  }

  static async getAnalytics(req, res, next) {
    try {
      const { period = '30d' } = req.query;
      const result = await AdminService.getAnalytics(period);
      
      const response = SuccessfulRes("Analytics data retrieved successfully", result);
      res.status(200).json(response);
    } catch (error) {
      next(globalError(error.message, 400));
    }
  }

  // User Management Controllers
  static async getAllUsers(req, res, next) {
    try {
      const { page = 1, limit = 10, search, status } = req.query;
      const filters = { search, status };
      
      const result = await AdminService.getAllUsers({ page, limit, filters });
      
      const response = SuccessfulRes("Users retrieved successfully", result);
      res.status(200).json(response);
    } catch (error) {
      next(globalError(error.message, 400));
    }
  }

  static async getUserDetails(req, res, next) {
    try {
      const { userId } = req.params;
      const result = await AdminService.getUserDetails(userId);
      
      const response = SuccessfulRes("User details retrieved successfully", result);
      res.status(200).json(response);
    } catch (error) {
      next(globalError(error.message, 404));
    }
  }

  static async updateUserStatus(req, res, next) {
    try {
      const { userId } = req.params;
      const { isActive } = req.body;
      
      const result = await AdminService.updateUserStatus(userId, isActive, req);
      
      const response = SuccessfulRes("User status updated successfully", result);
      res.status(200).json(response);
    } catch (error) {
      next(globalError(error.message, 400));
    }
  }

  static async deleteUser(req, res, next) {
    try {
      const { userId } = req.params;
      await AdminService.deleteUser(userId, req);
      
      const response = SuccessfulRes("User deleted successfully");
      res.status(200).json(response);
    } catch (error) {
      next(globalError(error.message, 400));
    }
  }

  // Content Moderation Controllers
  static async getContentForModeration(req, res, next) {
    try {
      const { page = 1, limit = 10, status, type } = req.query;
      const filters = { status, type };
      
      const result = await AdminService.getContentForModeration({ page, limit, filters });
      
      const response = SuccessfulRes("Content retrieved successfully", result);
      res.status(200).json(response);
    } catch (error) {
      next(globalError(error.message, 400));
    }
  }

  static async moderateContent(req, res, next) {
    try {
      const { contentId } = req.params;
      const { action, notes } = req.body; // action: 'approve', 'reject', 'flag'
      
      const result = await AdminService.moderateContent(contentId, action, notes, req);
      
      const response = SuccessfulRes("Content moderated successfully", result);
      res.status(200).json(response);
    } catch (error) {
      next(globalError(error.message, 400));
    }
  }

  // System Settings Controllers
  static async getSystemSettings(req, res, next) {
    try {
      const { category } = req.query;
      const result = await AdminService.getSystemSettings(category);
      
      const response = SuccessfulRes("System settings retrieved successfully", result);
      res.status(200).json(response);
    } catch (error) {
      next(globalError(error.message, 400));
    }
  }

  static async updateSystemSetting(req, res, next) {
    try {
      const settingData = AdminDTOMapper.mapSystemSettingsRequestToModel(req.body);
      settingData.lastModifiedBy = req.admin.id;
      
      const result = await AdminService.updateSystemSetting(settingData, req);
      
      const response = SuccessfulRes("System setting updated successfully", result);
      res.status(200).json(response);
    } catch (error) {
      next(globalError(error.message, 400));
    }
  }

  // Activity Log Controllers
  static async getActivityLogs(req, res, next) {
    try {
      const { page = 1, limit = 20, adminId, action, severity, startDate, endDate } = req.query;
      const filters = { adminId, action, severity, startDate, endDate };
      
      const result = await AdminService.getActivityLogs({ page, limit, filters });
      
      const response = SuccessfulRes("Activity logs retrieved successfully", result);
      res.status(200).json(response);
    } catch (error) {
      next(globalError(error.message, 400));
    }
  }

  // Profile Management Controllers
  static async getAdminProfile(req, res, next) {
    try {
      const result = await AdminService.getAdminProfile(req.admin.id);
      
      const response = SuccessfulRes("Admin profile retrieved successfully", result);
      res.status(200).json(response);
    } catch (error) {
      next(globalError(error.message, 404));
    }
  }

  static async updateAdminProfile(req, res, next) {
    try {
      const updateData = AdminDTOMapper.mapUpdateRequestToModel(req.body);
      const result = await AdminService.updateAdminProfile(req.admin.id, updateData, req);
      
      const response = SuccessfulRes("Admin profile updated successfully", result);
      res.status(200).json(response);
    } catch (error) {
      next(globalError(error.message, 400));
    }
  }

  static async changeAdminPassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return next(globalError("Current password and new password are required", 400));
      }
      
      await AdminService.changeAdminPassword(req.admin.id, currentPassword, newPassword, req);
      
      const response = SuccessfulRes("Password changed successfully");
      res.status(200).json(response);
    } catch (error) {
      next(globalError(error.message, 400));
    }
  }
}
