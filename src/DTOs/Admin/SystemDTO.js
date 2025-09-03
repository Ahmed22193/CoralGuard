// System Management Data Transfer Objects
export class SystemSettingsDTO {
  constructor(data = {}) {
    this.id = data.id || data._id;
    this.settingKey = data.settingKey;
    this.settingValue = data.settingValue;
    this.description = data.description;
    this.category = data.category;
    this.isEditable = data.isEditable;
    this.dataType = data.dataType;
    this.lastModifiedBy = data.lastModifiedBy;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class SystemSettingsRequestDTO {
  constructor(data = {}) {
    this.settingKey = data.settingKey;
    this.settingValue = data.settingValue;
    this.description = data.description;
    this.category = data.category || 'general';
    this.isEditable = data.isEditable !== undefined ? data.isEditable : true;
    this.dataType = data.dataType || 'string';
  }
}

export class AdminActivityLogDTO {
  constructor(data = {}) {
    this.id = data.id || data._id;
    this.adminId = data.adminId;
    this.adminName = data.adminName;
    this.action = data.action;
    this.targetType = data.targetType;
    this.targetId = data.targetId;
    this.description = data.description;
    this.ipAddress = data.ipAddress;
    this.userAgent = data.userAgent;
    this.metadata = data.metadata;
    this.severity = data.severity;
    this.createdAt = data.createdAt;
  }
}

export class ActivityLogRequestDTO {
  constructor(data = {}) {
    this.action = data.action;
    this.targetType = data.targetType;
    this.targetId = data.targetId;
    this.description = data.description;
    this.metadata = data.metadata;
    this.severity = data.severity || 'low';
  }
}

export class UserManagementDTO {
  constructor(data = {}) {
    this.id = data.id || data._id;
    this.name = data.name;
    this.email = data.email;
    this.isActive = data.isActive;
    this.imagesCount = data.imagesCount || 0;
    this.lastLogin = data.lastLogin;
    this.createdAt = data.createdAt;
    this.status = data.status || 'active';
  }
}

export class ContentModerationDTO {
  constructor(data = {}) {
    this.id = data.id || data._id;
    this.imageUrl = data.imageUrl;
    this.userId = data.userId;
    this.userName = data.userName;
    this.type = data.type;
    this.percentage = data.percentage;
    this.status = data.status || 'pending';
    this.moderatedBy = data.moderatedBy;
    this.moderationNotes = data.moderationNotes;
    this.createdAt = data.createdAt;
    this.moderatedAt = data.moderatedAt;
  }
}

export class AnalyticsDTO {
  constructor(data = {}) {
    this.totalUsers = data.totalUsers || 0;
    this.totalImages = data.totalImages || 0;
    this.totalAnalyses = data.totalAnalyses || 0;
    this.coralHealthStats = data.coralHealthStats || {};
    this.userGrowth = data.userGrowth || [];
    this.imageUploadTrends = data.imageUploadTrends || [];
    this.systemPerformance = data.systemPerformance || {};
    this.topUsers = data.topUsers || [];
  }
}
