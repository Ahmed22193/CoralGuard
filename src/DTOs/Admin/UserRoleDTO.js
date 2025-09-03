// User Role Management Data Transfer Objects
export class UserRoleDTO {
  constructor(data = {}) {
    this.id = data.id || data._id;
    this.name = data.name;
    this.email = data.email;
    this.role = data.role;
    this.roleDisplayName = data.roleDisplayName;
    this.permissions = data.permissions || [];
    this.isActive = data.isActive;
    this.isVerified = data.isVerified;
    this.subscription = data.subscription;
    this.subscriptionStatus = data.subscriptionStatus;
    this.profile = data.profile;
    this.lastLogin = data.lastLogin;
    this.roleChangedBy = data.roleChangedBy;
    this.roleChangedAt = data.roleChangedAt;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class UserRoleChangeRequestDTO {
  constructor(data = {}) {
    this.userId = data.userId;
    this.newRole = data.newRole;
    this.permissions = data.permissions || [];
    this.reason = data.reason;
    this.subscription = data.subscription;
    this.notifyUser = data.notifyUser !== false; // Default true
  }
}

export class UserRoleHistoryDTO {
  constructor(data = {}) {
    this.id = data.id || data._id;
    this.userId = data.userId;
    this.userName = data.userName;
    this.previousRole = data.previousRole;
    this.newRole = data.newRole;
    this.previousPermissions = data.previousPermissions || [];
    this.newPermissions = data.newPermissions || [];
    this.reason = data.reason;
    this.changedBy = data.changedBy;
    this.changedByName = data.changedByName;
    this.changedAt = data.changedAt;
    this.ipAddress = data.ipAddress;
  }
}

export class BulkRoleChangeRequestDTO {
  constructor(data = {}) {
    this.userIds = data.userIds || [];
    this.newRole = data.newRole;
    this.permissions = data.permissions || [];
    this.reason = data.reason;
    this.notifyUsers = data.notifyUsers !== false;
  }
}

export class RolePermissionTemplateDTO {
  constructor(data = {}) {
    this.role = data.role;
    this.displayName = data.displayName;
    this.description = data.description;
    this.defaultPermissions = data.defaultPermissions || [];
    this.features = data.features || [];
    this.limitations = data.limitations || [];
    this.subscriptionRequired = data.subscriptionRequired || false;
  }
}

export class UserSubscriptionDTO {
  constructor(data = {}) {
    this.plan = data.plan;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.isActive = data.isActive;
    this.features = data.features || [];
    this.limitations = data.limitations || [];
  }
}

export class UserManagementStatsDTO {
  constructor(data = {}) {
    this.totalUsers = data.totalUsers || 0;
    this.activeUsers = data.activeUsers || 0;
    this.usersByRole = data.usersByRole || {};
    this.usersBySubscription = data.usersBySubscription || {};
    this.recentRoleChanges = data.recentRoleChanges || [];
    this.growthStats = data.growthStats || {};
  }
}
