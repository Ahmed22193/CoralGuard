import { globalError } from "../Utils/gloabelError.js";

export const adminPermissionCheck = (requiredPermissions = []) => {
  return (req, res, next) => {
    try {
      const admin = req.admin;
      
      if (!admin) {
        return next(globalError("Admin authentication required", 401));
      }

      // Super admin has all permissions
      if (admin.role === 'super_admin') {
        return next();
      }

      // Check if admin has required permissions
      const hasPermission = requiredPermissions.some(permission => 
        admin.permissions.includes(permission)
      );

      if (!hasPermission && requiredPermissions.length > 0) {
        return next(globalError("Insufficient permissions", 403));
      }

      next();
    } catch (error) {
      return next(globalError("Permission check failed", 500));
    }
  };
};

export const roleCheck = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      const admin = req.admin;
      
      if (!admin) {
        return next(globalError("Admin authentication required", 401));
      }

      if (!allowedRoles.includes(admin.role)) {
        return next(globalError("Insufficient role permissions", 403));
      }

      next();
    } catch (error) {
      return next(globalError("Role check failed", 500));
    }
  };
};
