import Admin from "../../DB/Models/Admin/admin.model.js";
import AdminActivityLog from "../../DB/Models/Admin/adminActivityLog.model.js";
import SystemSettings from "../../DB/Models/Admin/systemSettings.model.js";
import User from "../../DB/Models/users.model.js";
import { AdminDTOMapper } from "../../DTOs/Admin/AdminDTOMapper.js";
import { hashPassword, verifyPassword } from "../../Utils/hash.utils.js";
import { generateToken, verifyToken } from "../../Utils/encryption.js";

export class AdminService {
  
  // Authentication Services
  static async login(credentials, req) {
    try {
      const { email, password } = credentials;
      
      // Find admin by email
      const admin = await Admin.findOne({ email, isActive: true });
      if (!admin) {
        throw new Error("Invalid credentials");
      }

      // Verify password
      const isPasswordValid = await verifyPassword(password, admin.password);
      if (!isPasswordValid) {
        throw new Error("Invalid credentials");
      }

      // Update last login
      admin.lastLogin = new Date();
      await admin.save();

      // Log activity
      await this.logActivity({
        adminId: admin._id,
        action: 'login',
        description: 'Admin logged in successfully',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        severity: 'low'
      });

      // Generate token
      const token = generateToken({ 
        id: admin._id, 
        email: admin.email, 
        role: admin.role,
        type: 'admin'
      });

      const adminResponse = AdminDTOMapper.mapModelToResponse(admin);
      
      return {
        admin: adminResponse,
        token
      };
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  static async register(adminData, req) {
    try {
      // Check if admin already exists
      const existingAdmin = await Admin.findOne({ email: adminData.email });
      if (existingAdmin) {
        throw new Error("Admin with this email already exists");
      }

      // Hash password
      const hashedPassword = await hashPassword(adminData.password);
      adminData.password = hashedPassword;

      // Create admin
      const newAdmin = new Admin(adminData);
      await newAdmin.save();

      // Log activity
      await this.logActivity({
        adminId: req.admin?.id || newAdmin._id,
        action: 'create_user',
        targetType: 'Admin',
        targetId: newAdmin._id,
        description: `New admin created: ${newAdmin.email}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        severity: 'medium'
      });

      const adminResponse = AdminDTOMapper.mapModelToResponse(newAdmin);
      return adminResponse;
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  static async logout(adminId, req) {
    try {
      // Log activity
      await this.logActivity({
        adminId,
        action: 'logout',
        description: 'Admin logged out',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        severity: 'low'
      });

      return true;
    } catch (error) {
      throw new Error(`Logout failed: ${error.message}`);
    }
  }

  // Admin Management Services
  static async getAllAdmins({ page = 1, limit = 10, filters = {} }) {
    try {
      const query = {};
      
      if (filters.role) query.role = filters.role;
      if (filters.isActive !== undefined) query.isActive = filters.isActive;
      if (filters.search) {
        query.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { email: { $regex: filters.search, $options: 'i' } },
          { department: { $regex: filters.search, $options: 'i' } }
        ];
      }

      const skip = (page - 1) * limit;
      const admins = await Admin.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Admin.countDocuments(query);
      const totalPages = Math.ceil(total / limit);

      const adminList = AdminDTOMapper.mapModelsToListResponse(admins);

      return {
        admins: adminList.admins,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          total,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      throw new Error(`Failed to get admins: ${error.message}`);
    }
  }

  static async getAdminById(adminId) {
    try {
      const admin = await Admin.findById(adminId).select('-password');
      if (!admin) {
        throw new Error("Admin not found");
      }

      return AdminDTOMapper.mapModelToResponse(admin);
    } catch (error) {
      throw new Error(`Failed to get admin: ${error.message}`);
    }
  }

  static async updateAdmin(adminId, updateData, req) {
    try {
      const admin = await Admin.findById(adminId);
      if (!admin) {
        throw new Error("Admin not found");
      }

      // Check email uniqueness if email is being updated
      if (updateData.email && updateData.email !== admin.email) {
        const existingAdmin = await Admin.findOne({ email: updateData.email });
        if (existingAdmin) {
          throw new Error("Email already exists");
        }
      }

      const updatedAdmin = await Admin.findByIdAndUpdate(
        adminId,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');

      // Log activity
      await this.logActivity({
        adminId: req.admin.id,
        action: 'update_user',
        targetType: 'Admin',
        targetId: adminId,
        description: `Admin updated: ${updatedAdmin.email}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        metadata: { updatedFields: Object.keys(updateData) },
        severity: 'medium'
      });

      return AdminDTOMapper.mapModelToResponse(updatedAdmin);
    } catch (error) {
      throw new Error(`Failed to update admin: ${error.message}`);
    }
  }

  static async deleteAdmin(adminId, req) {
    try {
      const admin = await Admin.findById(adminId);
      if (!admin) {
        throw new Error("Admin not found");
      }

      // Prevent self-deletion
      if (adminId === req.admin.id) {
        throw new Error("Cannot delete your own account");
      }

      await Admin.findByIdAndDelete(adminId);

      // Log activity
      await this.logActivity({
        adminId: req.admin.id,
        action: 'delete_user',
        targetType: 'Admin',
        targetId: adminId,
        description: `Admin deleted: ${admin.email}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        severity: 'high'
      });

      return true;
    } catch (error) {
      throw new Error(`Failed to delete admin: ${error.message}`);
    }
  }

  static async changeAdminStatus(adminId, isActive, req) {
    try {
      const admin = await Admin.findByIdAndUpdate(
        adminId,
        { isActive },
        { new: true }
      ).select('-password');

      if (!admin) {
        throw new Error("Admin not found");
      }

      // Log activity
      await this.logActivity({
        adminId: req.admin.id,
        action: 'permission_change',
        targetType: 'Admin',
        targetId: adminId,
        description: `Admin status changed to ${isActive ? 'active' : 'inactive'}: ${admin.email}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        severity: 'medium'
      });

      return AdminDTOMapper.mapModelToResponse(admin);
    } catch (error) {
      throw new Error(`Failed to change admin status: ${error.message}`);
    }
  }

  // Dashboard Services
  static async getDashboardData() {
    try {
      const [totalUsers, totalAdmins, totalImages, recentActivities] = await Promise.all([
        User.countDocuments(),
        Admin.countDocuments({ isActive: true }),
        this.getTotalImagesCount(),
        this.getRecentActivities(10)
      ]);

      const systemHealth = await this.getSystemHealth();
      const analyticsData = await this.getBasicAnalytics();

      const dashboardData = {
        totalUsers,
        totalAdmins,
        totalImages,
        recentActivities,
        systemHealth,
        analyticsData
      };

      return AdminDTOMapper.mapDashboardDataToResponse(dashboardData);
    } catch (error) {
      throw new Error(`Failed to get dashboard data: ${error.message}`);
    }
  }

  static async getAnalytics(period) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        default:
          startDate.setDate(endDate.getDate() - 30);
      }

      const [userGrowth, imageUploadTrends, topUsers] = await Promise.all([
        this.getUserGrowthData(startDate, endDate),
        this.getImageUploadTrends(startDate, endDate),
        this.getTopUsers(10)
      ]);

      const analyticsData = {
        totalUsers: await User.countDocuments(),
        totalImages: await this.getTotalImagesCount(),
        totalAnalyses: await this.getTotalAnalysesCount(),
        userGrowth,
        imageUploadTrends,
        topUsers,
        period
      };

      return AdminDTOMapper.mapAnalyticsDataToResponse(analyticsData);
    } catch (error) {
      throw new Error(`Failed to get analytics: ${error.message}`);
    }
  }

  // User Management Services
  static async getAllUsers({ page = 1, limit = 10, filters = {} }) {
    try {
      const query = {};
      
      if (filters.status === 'active') query.isActive = true;
      if (filters.status === 'inactive') query.isActive = false;
      if (filters.search) {
        query.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { email: { $regex: filters.search, $options: 'i' } }
        ];
      }

      const skip = (page - 1) * limit;
      const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await User.countDocuments(query);
      const totalPages = Math.ceil(total / limit);

      const userList = users.map(user => AdminDTOMapper.mapUserToManagementDTO(user));

      return {
        users: userList,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          total,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      throw new Error(`Failed to get users: ${error.message}`);
    }
  }

  static async getUserDetails(userId) {
    try {
      const user = await User.findById(userId).select('-password');
      if (!user) {
        throw new Error("User not found");
      }

      const userImages = await this.getUserImagesCount(userId);
      const userDetails = AdminDTOMapper.mapUserToManagementDTO(user);
      userDetails.imagesCount = userImages;

      return userDetails;
    } catch (error) {
      throw new Error(`Failed to get user details: ${error.message}`);
    }
  }

  static async updateUserStatus(userId, isActive, req) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { isActive },
        { new: true }
      ).select('-password');

      if (!user) {
        throw new Error("User not found");
      }

      // Log activity
      await this.logActivity({
        adminId: req.admin.id,
        action: 'update_user',
        targetType: 'User',
        targetId: userId,
        description: `User status changed to ${isActive ? 'active' : 'inactive'}: ${user.email}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        severity: 'medium'
      });

      return AdminDTOMapper.mapUserToManagementDTO(user);
    } catch (error) {
      throw new Error(`Failed to update user status: ${error.message}`);
    }
  }

  static async deleteUser(userId, req) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Delete user's images first (if you have image collection)
      // await Image.deleteMany({ userId });

      await User.findByIdAndDelete(userId);

      // Log activity
      await this.logActivity({
        adminId: req.admin.id,
        action: 'delete_user',
        targetType: 'User',
        targetId: userId,
        description: `User deleted: ${user.email}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        severity: 'high'
      });

      return true;
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  // System Settings Services
  static async getSystemSettings(category) {
    try {
      const query = category ? { category } : {};
      const settings = await SystemSettings.find(query).sort({ category: 1, settingKey: 1 });
      
      return settings.map(setting => AdminDTOMapper.mapSystemSettingsToResponse(setting));
    } catch (error) {
      throw new Error(`Failed to get system settings: ${error.message}`);
    }
  }

  static async updateSystemSetting(settingData, req) {
    try {
      const setting = await SystemSettings.findOneAndUpdate(
        { settingKey: settingData.settingKey },
        settingData,
        { new: true, upsert: true, runValidators: true }
      );

      // Log activity
      await this.logActivity({
        adminId: req.admin.id,
        action: 'system_update',
        targetType: 'System',
        targetId: setting._id,
        description: `System setting updated: ${setting.settingKey}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        metadata: { settingKey: setting.settingKey, newValue: setting.settingValue },
        severity: 'medium'
      });

      return AdminDTOMapper.mapSystemSettingsToResponse(setting);
    } catch (error) {
      throw new Error(`Failed to update system setting: ${error.message}`);
    }
  }

  // Activity Log Services
  static async logActivity(activityData) {
    try {
      const activity = new AdminActivityLog(activityData);
      await activity.save();
      return activity;
    } catch (error) {
      console.error('Failed to log activity:', error.message);
      // Don't throw error for logging failures
    }
  }

  static async getActivityLogs({ page = 1, limit = 20, filters = {} }) {
    try {
      const query = {};
      
      if (filters.adminId) query.adminId = filters.adminId;
      if (filters.action) query.action = filters.action;
      if (filters.severity) query.severity = filters.severity;
      if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
        if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
      }

      const skip = (page - 1) * limit;
      const logs = await AdminActivityLog.find(query)
        .populate('adminId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await AdminActivityLog.countDocuments(query);
      const totalPages = Math.ceil(total / limit);

      const logList = logs.map(log => AdminDTOMapper.mapActivityLogToResponse(log));

      return {
        logs: logList,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          total,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      throw new Error(`Failed to get activity logs: ${error.message}`);
    }
  }

  // Profile Management Services
  static async getAdminProfile(adminId) {
    try {
      const admin = await Admin.findById(adminId).select('-password');
      if (!admin) {
        throw new Error("Admin not found");
      }

      return AdminDTOMapper.mapModelToResponse(admin);
    } catch (error) {
      throw new Error(`Failed to get admin profile: ${error.message}`);
    }
  }

  static async updateAdminProfile(adminId, updateData, req) {
    try {
      // Remove sensitive fields that shouldn't be updated via profile
      delete updateData.role;
      delete updateData.permissions;
      delete updateData.isActive;

      const admin = await Admin.findByIdAndUpdate(
        adminId,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');

      if (!admin) {
        throw new Error("Admin not found");
      }

      // Log activity
      await this.logActivity({
        adminId,
        action: 'update_user',
        targetType: 'Admin',
        targetId: adminId,
        description: 'Admin profile updated',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        metadata: { updatedFields: Object.keys(updateData) },
        severity: 'low'
      });

      return AdminDTOMapper.mapModelToResponse(admin);
    } catch (error) {
      throw new Error(`Failed to update admin profile: ${error.message}`);
    }
  }

  static async changeAdminPassword(adminId, currentPassword, newPassword, req) {
    try {
      const admin = await Admin.findById(adminId);
      if (!admin) {
        throw new Error("Admin not found");
      }

      // Verify current password
      const isCurrentPasswordValid = await verifyPassword(currentPassword, admin.password);
      if (!isCurrentPasswordValid) {
        throw new Error("Current password is incorrect");
      }

      // Hash new password
      const hashedNewPassword = await hashPassword(newPassword);
      admin.password = hashedNewPassword;
      await admin.save();

      // Log activity
      await this.logActivity({
        adminId,
        action: 'security_update',
        targetType: 'Admin',
        targetId: adminId,
        description: 'Admin password changed',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        severity: 'medium'
      });

      return true;
    } catch (error) {
      throw new Error(`Failed to change password: ${error.message}`);
    }
  }

  // Helper Methods
  static async getTotalImagesCount() {
    // Implement based on your Image model
    // return await Image.countDocuments();
    return 0; // Placeholder
  }

  static async getTotalAnalysesCount() {
    // Implement based on your analysis logic
    return 0; // Placeholder
  }

  static async getUserImagesCount(userId) {
    // Implement based on your Image model
    // return await Image.countDocuments({ userId });
    return 0; // Placeholder
  }

  static async getRecentActivities(limit = 10) {
    try {
      const activities = await AdminActivityLog.find()
        .populate('adminId', 'name email')
        .sort({ createdAt: -1 })
        .limit(limit);
      
      return activities.map(activity => AdminDTOMapper.mapActivityLogToResponse(activity));
    } catch (error) {
      return [];
    }
  }

  static async getSystemHealth() {
    // Implement system health checks
    return {
      database: 'healthy',
      storage: 'healthy',
      api: 'healthy',
      lastChecked: new Date()
    };
  }

  static async getBasicAnalytics() {
    try {
      const today = new Date();
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const [newUsersThisWeek, activeUsers] = await Promise.all([
        User.countDocuments({ createdAt: { $gte: lastWeek } }),
        User.countDocuments({ isActive: true })
      ]);

      return {
        newUsersThisWeek,
        activeUsers,
        userGrowthRate: 0 // Calculate based on previous period
      };
    } catch (error) {
      return {};
    }
  }

  static async getUserGrowthData(startDate, endDate) {
    // Implement user growth analytics
    return [];
  }

  static async getImageUploadTrends(startDate, endDate) {
    // Implement image upload trends
    return [];
  }

  static async getTopUsers(limit) {
    // Implement top users by activity
    return [];
  }
}
