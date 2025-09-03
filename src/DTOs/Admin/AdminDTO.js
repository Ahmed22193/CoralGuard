// Admin Data Transfer Objects
export class AdminDTO {
  constructor(data = {}) {
    this.id = data.id || data._id;
    this.name = data.name;
    this.email = data.email;
    this.role = data.role;
    this.permissions = data.permissions || [];
    this.isActive = data.isActive;
    this.lastLogin = data.lastLogin;
    this.profileImage = data.profileImage;
    this.phone = data.phone;
    this.department = data.department;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class AdminLoginRequestDTO {
  constructor(data = {}) {
    this.email = data.email;
    this.password = data.password;
  }
}

export class AdminRegisterRequestDTO {
  constructor(data = {}) {
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role || 'admin';
    this.permissions = data.permissions || [];
    this.phone = data.phone;
    this.department = data.department;
  }
}

export class AdminUpdateRequestDTO {
  constructor(data = {}) {
    this.name = data.name;
    this.email = data.email;
    this.role = data.role;
    this.permissions = data.permissions;
    this.isActive = data.isActive;
    this.phone = data.phone;
    this.department = data.department;
    this.profileImage = data.profileImage;
  }
}

export class AdminResponseDTO {
  constructor(data = {}) {
    this.id = data.id || data._id;
    this.name = data.name;
    this.email = data.email;
    this.role = data.role;
    this.permissions = data.permissions || [];
    this.isActive = data.isActive;
    this.lastLogin = data.lastLogin;
    this.profileImage = data.profileImage;
    this.phone = data.phone;
    this.department = data.department;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    // Exclude sensitive data like password
  }
}

export class AdminListResponseDTO {
  constructor(data = []) {
    this.admins = data.map(admin => new AdminResponseDTO(admin));
    this.total = data.length;
  }
}

export class AdminDashboardDTO {
  constructor(data = {}) {
    this.totalUsers = data.totalUsers || 0;
    this.totalAdmins = data.totalAdmins || 0;
    this.totalImages = data.totalImages || 0;
    this.recentActivities = data.recentActivities || [];
    this.systemHealth = data.systemHealth || {};
    this.analyticsData = data.analyticsData || {};
  }
}
