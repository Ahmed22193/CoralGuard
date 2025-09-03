import { 
  AdminDTO, 
  AdminLoginRequestDTO, 
  AdminRegisterRequestDTO, 
  AdminUpdateRequestDTO, 
  AdminResponseDTO,
  AdminListResponseDTO,
  AdminDashboardDTO
} from './AdminDTO.js';
import { 
  SystemSettingsDTO, 
  SystemSettingsRequestDTO, 
  AdminActivityLogDTO, 
  ActivityLogRequestDTO,
  UserManagementDTO,
  ContentModerationDTO,
  AnalyticsDTO
} from './SystemDTO.js';
import { DTOValidationError } from '../DTOUtils.js';

export class AdminDTOMapper {
  // Admin Authentication Mappings
  static mapLoginRequestToCredentials(requestData) {
    try {
      const loginDTO = new AdminLoginRequestDTO(requestData);
      
      if (!loginDTO.email || !loginDTO.password) {
        throw new DTOValidationError('Email and password are required');
      }
      
      return {
        email: loginDTO.email.toLowerCase().trim(),
        password: loginDTO.password
      };
    } catch (error) {
      throw new DTOValidationError(`Login mapping failed: ${error.message}`);
    }
  }

  static mapRegisterRequestToModel(requestData) {
    try {
      const registerDTO = new AdminRegisterRequestDTO(requestData);
      
      if (!registerDTO.name || !registerDTO.email || !registerDTO.password) {
        throw new DTOValidationError('Name, email, and password are required');
      }
      
      if (registerDTO.password.length < 6) {
        throw new DTOValidationError('Password must be at least 6 characters long');
      }
      
      return {
        name: registerDTO.name.trim(),
        email: registerDTO.email.toLowerCase().trim(),
        password: registerDTO.password,
        role: registerDTO.role || 'admin',
        permissions: registerDTO.permissions || [],
        phone: registerDTO.phone?.trim(),
        department: registerDTO.department?.trim()
      };
    } catch (error) {
      throw new DTOValidationError(`Registration mapping failed: ${error.message}`);
    }
  }

  static mapModelToResponse(adminModel) {
    try {
      return new AdminResponseDTO({
        id: adminModel._id,
        name: adminModel.name,
        email: adminModel.email,
        role: adminModel.role,
        permissions: adminModel.permissions,
        isActive: adminModel.isActive,
        lastLogin: adminModel.lastLogin,
        profileImage: adminModel.profileImage,
        phone: adminModel.phone,
        department: adminModel.department,
        createdAt: adminModel.createdAt,
        updatedAt: adminModel.updatedAt
      });
    } catch (error) {
      throw new DTOValidationError(`Admin response mapping failed: ${error.message}`);
    }
  }

  static mapModelsToListResponse(adminModels) {
    try {
      return new AdminListResponseDTO(adminModels);
    } catch (error) {
      throw new DTOValidationError(`Admin list mapping failed: ${error.message}`);
    }
  }

  // Admin Management Mappings
  static mapUpdateRequestToModel(requestData) {
    try {
      const updateDTO = new AdminUpdateRequestDTO(requestData);
      
      const updateData = {};
      if (updateDTO.name) updateData.name = updateDTO.name.trim();
      if (updateDTO.email) updateData.email = updateDTO.email.toLowerCase().trim();
      if (updateDTO.role) updateData.role = updateDTO.role;
      if (updateDTO.permissions) updateData.permissions = updateDTO.permissions;
      if (updateDTO.isActive !== undefined) updateData.isActive = updateDTO.isActive;
      if (updateDTO.phone) updateData.phone = updateDTO.phone.trim();
      if (updateDTO.department) updateData.department = updateDTO.department.trim();
      if (updateDTO.profileImage) updateData.profileImage = updateDTO.profileImage;
      
      return updateData;
    } catch (error) {
      throw new DTOValidationError(`Update mapping failed: ${error.message}`);
    }
  }

  // System Management Mappings
  static mapSystemSettingsRequestToModel(requestData) {
    try {
      const settingsDTO = new SystemSettingsRequestDTO(requestData);
      
      if (!settingsDTO.settingKey || settingsDTO.settingValue === undefined) {
        throw new DTOValidationError('Setting key and value are required');
      }
      
      return {
        settingKey: settingsDTO.settingKey.trim(),
        settingValue: settingsDTO.settingValue,
        description: settingsDTO.description?.trim(),
        category: settingsDTO.category,
        isEditable: settingsDTO.isEditable,
        dataType: settingsDTO.dataType
      };
    } catch (error) {
      throw new DTOValidationError(`System settings mapping failed: ${error.message}`);
    }
  }

  static mapSystemSettingsToResponse(settingsModel) {
    try {
      return new SystemSettingsDTO({
        id: settingsModel._id,
        settingKey: settingsModel.settingKey,
        settingValue: settingsModel.settingValue,
        description: settingsModel.description,
        category: settingsModel.category,
        isEditable: settingsModel.isEditable,
        dataType: settingsModel.dataType,
        lastModifiedBy: settingsModel.lastModifiedBy,
        createdAt: settingsModel.createdAt,
        updatedAt: settingsModel.updatedAt
      });
    } catch (error) {
      throw new DTOValidationError(`System settings response mapping failed: ${error.message}`);
    }
  }

  // Activity Log Mappings
  static mapActivityLogRequestToModel(requestData, adminId, ipAddress, userAgent) {
    try {
      const activityDTO = new ActivityLogRequestDTO(requestData);
      
      if (!activityDTO.action || !activityDTO.description) {
        throw new DTOValidationError('Action and description are required');
      }
      
      return {
        adminId,
        action: activityDTO.action,
        targetType: activityDTO.targetType,
        targetId: activityDTO.targetId,
        description: activityDTO.description,
        ipAddress,
        userAgent,
        metadata: activityDTO.metadata,
        severity: activityDTO.severity
      };
    } catch (error) {
      throw new DTOValidationError(`Activity log mapping failed: ${error.message}`);
    }
  }

  static mapActivityLogToResponse(logModel) {
    try {
      return new AdminActivityLogDTO({
        id: logModel._id,
        adminId: logModel.adminId,
        adminName: logModel.adminId?.name,
        action: logModel.action,
        targetType: logModel.targetType,
        targetId: logModel.targetId,
        description: logModel.description,
        ipAddress: logModel.ipAddress,
        userAgent: logModel.userAgent,
        metadata: logModel.metadata,
        severity: logModel.severity,
        createdAt: logModel.createdAt
      });
    } catch (error) {
      throw new DTOValidationError(`Activity log response mapping failed: ${error.message}`);
    }
  }

  // Dashboard Mappings
  static mapDashboardDataToResponse(dashboardData) {
    try {
      return new AdminDashboardDTO(dashboardData);
    } catch (error) {
      throw new DTOValidationError(`Dashboard mapping failed: ${error.message}`);
    }
  }

  // User Management Mappings
  static mapUserToManagementDTO(userModel) {
    try {
      return new UserManagementDTO({
        id: userModel._id,
        name: userModel.name,
        email: userModel.email,
        isActive: userModel.isActive || true,
        imagesCount: userModel.imagesCount || 0,
        lastLogin: userModel.lastLogin,
        createdAt: userModel.createdAt,
        status: userModel.isActive ? 'active' : 'inactive'
      });
    } catch (error) {
      throw new DTOValidationError(`User management mapping failed: ${error.message}`);
    }
  }

  // Content Moderation Mappings
  static mapImageToModerationDTO(imageModel) {
    try {
      return new ContentModerationDTO({
        id: imageModel._id,
        imageUrl: imageModel.image,
        userId: imageModel.userId,
        userName: imageModel.userId?.name,
        type: imageModel.type,
        percentage: imageModel.percentage,
        status: imageModel.status || 'approved',
        moderatedBy: imageModel.moderatedBy,
        moderationNotes: imageModel.moderationNotes,
        createdAt: imageModel.createdAt,
        moderatedAt: imageModel.moderatedAt
      });
    } catch (error) {
      throw new DTOValidationError(`Content moderation mapping failed: ${error.message}`);
    }
  }

  // Analytics Mappings
  static mapAnalyticsDataToResponse(analyticsData) {
    try {
      return new AnalyticsDTO(analyticsData);
    } catch (error) {
      throw new DTOValidationError(`Analytics mapping failed: ${error.message}`);
    }
  }
}
