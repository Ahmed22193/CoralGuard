import Admin from '../DB/Models/Admin/admin.model.js';
import User from '../DB/Models/users.model.js';

/**
 * Promote a user to admin status
 * @param {string} userId - The user ID to promote
 * @param {string} adminRole - The admin role to assign
 * @param {Object} adminData - Additional admin data
 * @param {string} promotedBy - ID of the admin promoting this user
 * @returns {Object} The new admin record
 */
export const promoteUserToAdmin = async (userId, adminRole = 'admin', adminData = {}, promotedBy) => {
  try {
    // Get the user data
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user is already an admin
    const existingAdmin = await Admin.findOne({ email: user.email });
    if (existingAdmin) {
      throw new Error('User is already an admin');
    }

    // Create admin record with user data + admin extensions
    const adminRecord = new Admin({
      // Copy user basic data
      name: user.name,
      email: user.email,
      password: user.password,
      isActive: user.isActive,
      isVerified: true, // Admins are verified by default
      
      // Admin-specific data
      role: adminRole,
      adminLevel: getAdminLevelByRole(adminRole),
      accessLevel: adminData.accessLevel || 'read',
      permissions: adminData.permissions || getDefaultPermissionsByRole(adminRole),
      
      // Copy user profile and extend it
      profile: {
        ...user.profile,
        department: adminData.department,
        phone: adminData.phone,
        emergencyContact: adminData.emergencyContact,
      },
      
      // Admin hierarchy
      createdBy: promotedBy,
      managedBy: adminData.managedBy || promotedBy,
    });

    // Save the admin record
    const savedAdmin = await adminRecord.save();

    // Update the original user record to mark as promoted
    await User.findByIdAndUpdate(userId, {
      role: 'moderator', // Update user role to show they have admin access
      roleChangedBy: promotedBy,
      roleChangedAt: new Date(),
    });

    return savedAdmin;
  } catch (error) {
    throw new Error(`Failed to promote user to admin: ${error.message}`);
  }
};

/**
 * Demote an admin back to regular user
 * @param {string} adminId - The admin ID to demote
 * @param {string} demotedBy - ID of the admin performing the demotion
 * @returns {Object} The updated user record
 */
export const demoteAdminToUser = async (adminId, demotedBy) => {
  try {
    // Get the admin data
    const admin = await Admin.findById(adminId);
    if (!admin) {
      throw new Error('Admin not found');
    }

    // Find the corresponding user record
    const user = await User.findOne({ email: admin.email });
    if (!user) {
      throw new Error('Corresponding user record not found');
    }

    // Update user record to remove admin privileges
    const updatedUser = await User.findByIdAndUpdate(user._id, {
      role: 'user', // Demote to regular user
      roleChangedBy: demotedBy,
      roleChangedAt: new Date(),
      // Keep their profile data
      profile: {
        ...user.profile,
        bio: admin.profile?.bio || user.profile?.bio,
        organization: admin.profile?.organization || user.profile?.organization,
        profileImage: admin.profile?.profileImage || user.profile?.profileImage,
      }
    }, { new: true });

    // Remove the admin record
    await Admin.findByIdAndDelete(adminId);

    return updatedUser;
  } catch (error) {
    throw new Error(`Failed to demote admin to user: ${error.message}`);
  }
};

/**
 * Get admin level by role
 * @param {string} role - The admin role
 * @returns {number} The admin level
 */
function getAdminLevelByRole(role) {
  const roleLevels = {
    'super_admin': 10,
    'system_admin': 8,
    'admin': 5,
    'content_admin': 3,
    'moderator': 1
  };
  return roleLevels[role] || 1;
}

/**
 * Get default permissions by role
 * @param {string} role - The admin role
 * @returns {Array} Array of permissions
 */
function getDefaultPermissionsByRole(role) {
  const rolePermissions = {
    'super_admin': [
      'user_management', 'content_moderation', 'system_settings', 
      'analytics_view', 'backup_restore', 'security_management',
      'admin_management', 'role_assignment', 'system_monitoring', 
      'database_access', 'api_access', 'priority_support'
    ],
    'system_admin': [
      'user_management', 'system_settings', 'analytics_view', 
      'backup_restore', 'security_management', 'system_monitoring',
      'api_access'
    ],
    'admin': [
      'user_management', 'content_moderation', 'analytics_view',
      'advanced_analysis', 'data_export'
    ],
    'content_admin': [
      'content_moderation', 'user_management', 'analytics_view',
      'image_upload', 'bulk_upload'
    ],
    'moderator': [
      'content_moderation', 'image_upload', 'advanced_analysis'
    ]
  };
  return rolePermissions[role] || ['content_moderation'];
}

/**
 * Check if an admin can perform an action on another admin
 * @param {Object} performingAdmin - The admin performing the action
 * @param {Object} targetAdmin - The target admin
 * @param {string} action - The action to perform
 * @returns {boolean} Whether the action is allowed
 */
export const canPerformAdminAction = (performingAdmin, targetAdmin, action) => {
  // Super admin can do anything
  if (performingAdmin.role === 'super_admin') return true;
  
  // Can't perform actions on higher level admins
  if (targetAdmin.adminLevel >= performingAdmin.adminLevel) return false;
  
  // Check specific actions
  const actionPermissions = {
    'edit': ['admin_management', 'user_management'],
    'delete': ['admin_management'],
    'promote': ['role_assignment', 'admin_management'],
    'demote': ['role_assignment', 'admin_management'],
    'view': ['user_management', 'admin_management']
  };
  
  const requiredPermissions = actionPermissions[action] || [];
  return requiredPermissions.some(permission => 
    performingAdmin.permissions.includes(permission)
  );
};

/**
 * Get admin dashboard permissions
 * @param {Object} admin - The admin object
 * @returns {Object} Dashboard permissions
 */
export const getAdminDashboardPermissions = (admin) => {
  return {
    canViewUsers: admin.hasPermission('user_management'),
    canEditUsers: admin.hasPermission('user_management') && admin.accessLevel !== 'read',
    canDeleteUsers: admin.hasPermission('user_management') && admin.accessLevel === 'full_access',
    canViewAnalytics: admin.hasPermission('analytics_view'),
    canManageContent: admin.hasPermission('content_moderation'),
    canManageSystem: admin.hasPermission('system_settings'),
    canManageAdmins: admin.hasPermission('admin_management'),
    canAssignRoles: admin.hasPermission('role_assignment'),
    canAccessDatabase: admin.hasPermission('database_access'),
    canPerformBackup: admin.hasPermission('backup_restore'),
    adminLevel: admin.adminLevel,
    accessLevel: admin.accessLevel
  };
};
