import Admin from "../../DB/Models/Admin/admin.model.js";
import AdminActivityLog from "../../DB/Models/Admin/adminActivityLog.model.js";
import SystemSettings from "../../DB/Models/Admin/systemSettings.model.js";
import UserRoleHistory from "../../DB/Models/Admin/userRoleHistory.model.js";
import User from "../../DB/Models/users.model.js";
import { AdminDTOMapper } from "../../DTOs/Admin/AdminDTOMapper.js";
import { UserRoleDTOMapper } from "../../DTOs/Admin/UserRoleDTOMapper.js";
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

  // User Role Management Services
  static async changeUserRole(roleChangeData, req) {
    try {
      const { userId, newRole, permissions, reason, notifyUser } = roleChangeData;

      // Find the user
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Validate role transition
      const isValidTransition = UserRoleDTOMapper.validateRoleTransition(
        user.role, 
        newRole, 
        req.admin.role
      );
      
      if (!isValidTransition) {
        throw new Error("Insufficient permissions to change to this role");
      }

      // Store previous data for history
      const previousRole = user.role;
      const previousPermissions = [...user.permissions];

      // Update user role and permissions
      user.role = newRole;
      user.permissions = permissions || UserRoleDTOMapper.getDefaultPermissionsForRole(newRole);
      user.roleChangedBy = req.admin.id;
      user.roleChangedAt = new Date();

      await user.save();

      // Create role change history
      await this.createRoleHistory({
        userId,
        previousRole,
        newRole,
        previousPermissions,
        newPermissions: user.permissions,
        reason,
        changedBy: req.admin.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        notificationSent: notifyUser
      });

      // Log activity
      await this.logActivity({
        adminId: req.admin.id,
        action: 'permission_change',
        targetType: 'User',
        targetId: userId,
        description: `User role changed from ${previousRole} to ${newRole}: ${user.email}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        metadata: { previousRole, newRole, reason },
        severity: 'medium'
      });

      // TODO: Send notification to user if notifyUser is true
      if (notifyUser) {
        await this.sendRoleChangeNotification(user, previousRole, newRole, reason);
      }

      return UserRoleDTOMapper.mapUserToRoleDTO(user);
    } catch (error) {
      throw new Error(`Failed to change user role: ${error.message}`);
    }
  }

  static async bulkChangeUserRoles(bulkChangeData, req) {
    try {
      const { userIds, newRole, permissions, reason, notifyUsers } = bulkChangeData;
      const results = [];
      const errors = [];

      // Validate role transition permission for admin
      const canChangeRole = UserRoleDTOMapper.validateRoleTransition(
        'user', // Use lowest role for validation
        newRole, 
        req.admin.role
      );
      
      if (!canChangeRole) {
        throw new Error("Insufficient permissions to change to this role");
      }

      for (const userId of userIds) {
        try {
          const result = await this.changeUserRole({
            userId,
            newRole,
            permissions,
            reason: `Bulk update: ${reason}`,
            notifyUser: notifyUsers
          }, req);
          
          results.push({
            userId,
            success: true,
            user: result
          });
        } catch (error) {
          errors.push({
            userId,
            success: false,
            error: error.message
          });
        }
      }

      // Log bulk operation
      await this.logActivity({
        adminId: req.admin.id,
        action: 'permission_change',
        targetType: 'User',
        description: `Bulk role change to ${newRole} for ${userIds.length} users`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        metadata: { newRole, userCount: userIds.length, successCount: results.length, errorCount: errors.length },
        severity: 'high'
      });

      return {
        successful: results,
        failed: errors,
        summary: {
          total: userIds.length,
          successful: results.length,
          failed: errors.length
        }
      };
    } catch (error) {
      throw new Error(`Failed to bulk change user roles: ${error.message}`);
    }
  }

  static async getUserRoleHistory(userId, { page = 1, limit = 10 } = {}) {
    try {
      const skip = (page - 1) * limit;
      
      const history = await UserRoleHistory.find({ userId })
        .populate('changedBy', 'name email')
        .sort({ changedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await UserRoleHistory.countDocuments({ userId });
      const totalPages = Math.ceil(total / limit);

      const historyList = UserRoleDTOMapper.mapRoleHistoryListToDTO(history);

      return {
        history: historyList,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          total,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      throw new Error(`Failed to get user role history: ${error.message}`);
    }
  }

  static async getAllRoleHistory({ page = 1, limit = 20, filters = {} } = {}) {
    try {
      const query = {};
      
      if (filters.userId) query.userId = filters.userId;
      if (filters.newRole) query.newRole = filters.newRole;
      if (filters.changedBy) query.changedBy = filters.changedBy;
      if (filters.startDate || filters.endDate) {
        query.changedAt = {};
        if (filters.startDate) query.changedAt.$gte = new Date(filters.startDate);
        if (filters.endDate) query.changedAt.$lte = new Date(filters.endDate);
      }

      const skip = (page - 1) * limit;
      
      const history = await UserRoleHistory.find(query)
        .populate('userId', 'name email')
        .populate('changedBy', 'name email')
        .sort({ changedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await UserRoleHistory.countDocuments(query);
      const totalPages = Math.ceil(total / limit);

      const historyList = UserRoleDTOMapper.mapRoleHistoryListToDTO(history);

      return {
        history: historyList,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          total,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      throw new Error(`Failed to get role history: ${error.message}`);
    }
  }

  static async getUsersByRole(role, { page = 1, limit = 10, filters = {} } = {}) {
    try {
      const query = { role };
      
      if (filters.isActive !== undefined) query.isActive = filters.isActive;
      if (filters.isVerified !== undefined) query.isVerified = filters.isVerified;
      if (filters.search) {
        query.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { email: { $regex: filters.search, $options: 'i' } },
          { 'profile.organization': { $regex: filters.search, $options: 'i' } }
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

      const userList = UserRoleDTOMapper.mapUsersToRoleListDTO(users);

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
      throw new Error(`Failed to get users by role: ${error.message}`);
    }
  }

  static async getUserRoleStats() {
    try {
      // Get user counts by role
      const usersByRole = await User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      // Get user counts by subscription
      const usersBySubscription = await User.aggregate([
        { $group: { _id: '$subscription.plan', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      // Get recent role changes
      const recentRoleChanges = await UserRoleHistory.find()
        .populate('userId', 'name email')
        .populate('changedBy', 'name email')
        .sort({ changedAt: -1 })
        .limit(10);

      // Calculate growth stats
      const today = new Date();
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [totalUsers, activeUsers, newUsersThisWeek, newUsersThisMonth] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ createdAt: { $gte: lastWeek } }),
        User.countDocuments({ createdAt: { $gte: lastMonth } })
      ]);

      const statsData = {
        totalUsers,
        activeUsers,
        usersByRole: Object.fromEntries(usersByRole.map(item => [item._id, item.count])),
        usersBySubscription: Object.fromEntries(usersBySubscription.map(item => [item._id, item.count])),
        recentRoleChanges: UserRoleDTOMapper.mapRoleHistoryListToDTO(recentRoleChanges),
        growthStats: {
          newUsersThisWeek,
          newUsersThisMonth,
          weeklyGrowthRate: totalUsers > 0 ? (newUsersThisWeek / totalUsers * 100).toFixed(2) : 0,
          monthlyGrowthRate: totalUsers > 0 ? (newUsersThisMonth / totalUsers * 100).toFixed(2) : 0
        }
      };

      return UserRoleDTOMapper.mapUserStatsToDTO(statsData);
    } catch (error) {
      throw new Error(`Failed to get user role stats: ${error.message}`);
    }
  }

  static async getRoleTemplates() {
    try {
      return UserRoleDTOMapper.mapRoleTemplatesToDTO();
    } catch (error) {
      throw new Error(`Failed to get role templates: ${error.message}`);
    }
  }

  static async updateUserSubscription(userId, subscriptionData, req) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const previousSubscription = { ...user.subscription };
      
      user.subscription = {
        ...user.subscription,
        ...subscriptionData,
        startDate: subscriptionData.startDate || new Date(),
        endDate: subscriptionData.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Default 30 days
      };

      await user.save();

      // Log activity
      await this.logActivity({
        adminId: req.admin.id,
        action: 'update_user',
        targetType: 'User',
        targetId: userId,
        description: `User subscription updated: ${user.email}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        metadata: { previousSubscription, newSubscription: user.subscription },
        severity: 'medium'
      });

      return UserRoleDTOMapper.mapSubscriptionToDTO(user.subscription);
    } catch (error) {
      throw new Error(`Failed to update user subscription: ${error.message}`);
    }
  }

  // Helper method to create role history
  static async createRoleHistory(historyData) {
    try {
      const history = new UserRoleHistory(historyData);
      await history.save();
      return history;
    } catch (error) {
      console.error('Failed to create role history:', error.message);
      // Don't throw error for history creation failures
    }
  }

  // Helper method to send role change notification
  static async sendRoleChangeNotification(user, previousRole, newRole, reason) {
    try {
      // TODO: Implement email/notification service
      console.log(`Sending role change notification to ${user.email}: ${previousRole} -> ${newRole}`);
      // This would integrate with your email service
    } catch (error) {
      console.error('Failed to send role change notification:', error.message);
      // Don't throw error for notification failures
    }
  }
}
