import { 
  UserRoleDTO, 
  UserRoleChangeRequestDTO, 
  UserRoleHistoryDTO, 
  BulkRoleChangeRequestDTO,
  RolePermissionTemplateDTO,
  UserSubscriptionDTO,
  UserManagementStatsDTO
} from './UserRoleDTO.js';
import { DTOValidationError } from '../DTOUtils.js';

export class UserRoleDTOMapper {
  
  // Role Change Request Mappings
  static mapRoleChangeRequestToModel(requestData) {
    try {
      const roleChangeDTO = new UserRoleChangeRequestDTO(requestData);
      
      if (!roleChangeDTO.userId || !roleChangeDTO.newRole) {
        throw new DTOValidationError('User ID and new role are required');
      }
      
      if (!this.isValidRole(roleChangeDTO.newRole)) {
        throw new DTOValidationError('Invalid role specified');
      }
      
      if (!roleChangeDTO.reason || roleChangeDTO.reason.trim().length < 10) {
        throw new DTOValidationError('Reason for role change must be at least 10 characters');
      }
      
      return {
        userId: roleChangeDTO.userId,
        newRole: roleChangeDTO.newRole,
        permissions: roleChangeDTO.permissions || this.getDefaultPermissionsForRole(roleChangeDTO.newRole),
        reason: roleChangeDTO.reason.trim(),
        subscription: roleChangeDTO.subscription,
        notifyUser: roleChangeDTO.notifyUser
      };
    } catch (error) {
      throw new DTOValidationError(`Role change mapping failed: ${error.message}`);
    }
  }

  static mapBulkRoleChangeRequestToModel(requestData) {
    try {
      const bulkChangeDTO = new BulkRoleChangeRequestDTO(requestData);
      
      if (!bulkChangeDTO.userIds || bulkChangeDTO.userIds.length === 0) {
        throw new DTOValidationError('At least one user ID is required');
      }
      
      if (!bulkChangeDTO.newRole) {
        throw new DTOValidationError('New role is required');
      }
      
      if (!this.isValidRole(bulkChangeDTO.newRole)) {
        throw new DTOValidationError('Invalid role specified');
      }
      
      if (!bulkChangeDTO.reason || bulkChangeDTO.reason.trim().length < 10) {
        throw new DTOValidationError('Reason for bulk role change must be at least 10 characters');
      }
      
      return {
        userIds: bulkChangeDTO.userIds,
        newRole: bulkChangeDTO.newRole,
        permissions: bulkChangeDTO.permissions || this.getDefaultPermissionsForRole(bulkChangeDTO.newRole),
        reason: bulkChangeDTO.reason.trim(),
        notifyUsers: bulkChangeDTO.notifyUsers
      };
    } catch (error) {
      throw new DTOValidationError(`Bulk role change mapping failed: ${error.message}`);
    }
  }

  // User Role Response Mappings
  static mapUserToRoleDTO(userModel) {
    try {
      return new UserRoleDTO({
        id: userModel._id,
        name: userModel.name,
        email: userModel.email,
        role: userModel.role,
        roleDisplayName: userModel.roleDisplayName,
        permissions: userModel.permissions,
        isActive: userModel.isActive,
        isVerified: userModel.isVerified,
        subscription: userModel.subscription,
        subscriptionStatus: userModel.subscriptionStatus,
        profile: userModel.profile,
        lastLogin: userModel.lastLogin,
        roleChangedBy: userModel.roleChangedBy,
        roleChangedAt: userModel.roleChangedAt,
        createdAt: userModel.createdAt,
        updatedAt: userModel.updatedAt
      });
    } catch (error) {
      throw new DTOValidationError(`User role mapping failed: ${error.message}`);
    }
  }

  static mapUsersToRoleListDTO(userModels) {
    try {
      return userModels.map(user => this.mapUserToRoleDTO(user));
    } catch (error) {
      throw new DTOValidationError(`User role list mapping failed: ${error.message}`);
    }
  }

  // Role History Mappings
  static mapRoleHistoryToDTO(historyModel) {
    try {
      return new UserRoleHistoryDTO({
        id: historyModel._id,
        userId: historyModel.userId,
        userName: historyModel.userId?.name,
        previousRole: historyModel.previousRole,
        newRole: historyModel.newRole,
        previousPermissions: historyModel.previousPermissions,
        newPermissions: historyModel.newPermissions,
        reason: historyModel.reason,
        changedBy: historyModel.changedBy,
        changedByName: historyModel.changedBy?.name,
        changedAt: historyModel.changedAt,
        ipAddress: historyModel.ipAddress
      });
    } catch (error) {
      throw new DTOValidationError(`Role history mapping failed: ${error.message}`);
    }
  }

  static mapRoleHistoryListToDTO(historyModels) {
    try {
      return historyModels.map(history => this.mapRoleHistoryToDTO(history));
    } catch (error) {
      throw new DTOValidationError(`Role history list mapping failed: ${error.message}`);
    }
  }

  // Statistics Mappings
  static mapUserStatsToDTO(statsData) {
    try {
      return new UserManagementStatsDTO(statsData);
    } catch (error) {
      throw new DTOValidationError(`User stats mapping failed: ${error.message}`);
    }
  }

  // Role Template Mappings
  static mapRoleTemplatesToDTO() {
    try {
      return this.getRoleTemplates().map(template => new RolePermissionTemplateDTO(template));
    } catch (error) {
      throw new DTOValidationError(`Role templates mapping failed: ${error.message}`);
    }
  }

  // Subscription Mappings
  static mapSubscriptionToDTO(subscriptionData) {
    try {
      return new UserSubscriptionDTO(subscriptionData);
    } catch (error) {
      throw new DTOValidationError(`Subscription mapping failed: ${error.message}`);
    }
  }

  // Helper Methods
  static isValidRole(role) {
    const validRoles = ['user', 'premium', 'researcher', 'scientist', 'moderator'];
    return validRoles.includes(role);
  }

  static isValidPermission(permission) {
    const validPermissions = [
      'image_upload',
      'advanced_analysis',
      'data_export',
      'bulk_upload',
      'api_access',
      'priority_support'
    ];
    return validPermissions.includes(permission);
  }

  static getDefaultPermissionsForRole(role) {
    const rolePermissions = {
      'user': ['image_upload'],
      'premium': ['image_upload', 'advanced_analysis', 'priority_support'],
      'researcher': ['image_upload', 'advanced_analysis', 'data_export', 'api_access'],
      'scientist': ['image_upload', 'advanced_analysis', 'data_export', 'bulk_upload', 'api_access', 'priority_support'],
      'moderator': ['image_upload', 'advanced_analysis', 'data_export']
    };
    return rolePermissions[role] || ['image_upload'];
  }

  static getRoleTemplates() {
    return [
      {
        role: 'user',
        displayName: 'Regular User',
        description: 'Basic coral image analysis access',
        defaultPermissions: ['image_upload'],
        features: ['Basic image upload', 'Simple coral analysis', 'View results'],
        limitations: ['Limited uploads per month', 'Basic support'],
        subscriptionRequired: false
      },
      {
        role: 'premium',
        displayName: 'Premium User',
        description: 'Enhanced features with priority support',
        defaultPermissions: ['image_upload', 'advanced_analysis', 'priority_support'],
        features: ['Unlimited uploads', 'Advanced analysis', 'Priority support', 'Historical data'],
        limitations: ['Limited API access'],
        subscriptionRequired: true
      },
      {
        role: 'researcher',
        displayName: 'Researcher',
        description: 'Academic research access with data export',
        defaultPermissions: ['image_upload', 'advanced_analysis', 'data_export', 'api_access'],
        features: ['Data export', 'API access', 'Research tools', 'Collaboration features'],
        limitations: ['No bulk upload'],
        subscriptionRequired: false
      },
      {
        role: 'scientist',
        displayName: 'Marine Scientist',
        description: 'Full access for marine scientists',
        defaultPermissions: ['image_upload', 'advanced_analysis', 'data_export', 'bulk_upload', 'api_access', 'priority_support'],
        features: ['Full API access', 'Bulk upload', 'Advanced analytics', 'Custom models'],
        limitations: [],
        subscriptionRequired: false
      },
      {
        role: 'moderator',
        displayName: 'Content Moderator',
        description: 'Content moderation and quality control',
        defaultPermissions: ['image_upload', 'advanced_analysis', 'data_export'],
        features: ['Content moderation', 'Quality control', 'User management'],
        limitations: ['No bulk operations'],
        subscriptionRequired: false
      }
    ];
  }

  static getSubscriptionPlans() {
    return [
      {
        plan: 'free',
        displayName: 'Free Plan',
        features: ['5 uploads per month', 'Basic analysis', 'Community support'],
        price: 0,
        duration: 'lifetime'
      },
      {
        plan: 'basic',
        displayName: 'Basic Plan',
        features: ['50 uploads per month', 'Advanced analysis', 'Email support'],
        price: 9.99,
        duration: 'monthly'
      },
      {
        plan: 'premium',
        displayName: 'Premium Plan',
        features: ['Unlimited uploads', 'Priority support', 'API access', 'Data export'],
        price: 29.99,
        duration: 'monthly'
      },
      {
        plan: 'enterprise',
        displayName: 'Enterprise Plan',
        features: ['Custom limits', 'Dedicated support', 'Custom models', 'White-label'],
        price: 99.99,
        duration: 'monthly'
      }
    ];
  }

  static validateRoleTransition(currentRole, newRole, adminRole) {
    // Define role hierarchy and allowed transitions
    const roleHierarchy = {
      'user': 1,
      'premium': 2,
      'researcher': 3,
      'moderator': 4,
      'scientist': 5
    };

    const adminHierarchy = {
      'moderator': 3,
      'admin': 4,
      'super_admin': 5
    };

    // Super admin can change any role
    if (adminRole === 'super_admin') return true;

    // Admin can manage roles below scientist level
    if (adminRole === 'admin' && roleHierarchy[newRole] < 5) return true;

    // Moderators can only manage basic user roles
    if (adminRole === 'moderator' && roleHierarchy[newRole] <= 2) return true;

    return false;
  }
}
