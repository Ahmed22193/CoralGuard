import mongoose, { Schema } from "mongoose";

const AdminSchema = new Schema(
  {
    // Inherit basic user fields
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      // unique: true, // Removed to avoid duplicate index warning
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    // Extended role for admin system
    role: {
      type: String,
      enum: ['super_admin', 'admin', 'moderator', 'system_admin', 'content_admin'],
      default: 'admin',
    },
    // Admin-specific permissions (extended from user permissions)
    permissions: [{
      type: String,
      enum: [
        // User permissions inherited
        'image_upload',
        'advanced_analysis',
        'data_export',
        'bulk_upload',
        'api_access',
        'priority_support',
        // Admin-specific permissions
        'user_management',
        'content_moderation',
        'system_settings',
        'analytics_view',
        'backup_restore',
        'security_management',
        'admin_management',
        'role_assignment',
        'system_monitoring',
        'database_access'
      ]
    }],
    // Inherit user status fields
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: true, // Admins are verified by default
    },
    // Enhanced profile for admin
    profile: {
      bio: String,
      organization: String,
      location: String,
      website: String,
      profileImage: String,
      department: String,
      phone: String,
      emergencyContact: String,
    },
    // Admin-specific fields
    adminLevel: {
      type: Number,
      min: 1,
      max: 10,
      default: 1, // 1 = basic admin, 10 = super admin
    },
    accessLevel: {
      type: String,
      enum: ['read', 'write', 'full_access'],
      default: 'read',
    },
    // Tracking fields
    lastLogin: {
      type: Date,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
    // Admin hierarchy
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    managedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for full name (inherited from user concept)
AdminSchema.virtual('fullName').get(function() {
  return this.name;
});

// Virtual for admin status display
AdminSchema.virtual('adminStatusDisplay').get(function() {
  const statusMap = {
    'super_admin': 'Super Administrator',
    'admin': 'Administrator',
    'moderator': 'Content Moderator',
    'system_admin': 'System Administrator',
    'content_admin': 'Content Administrator'
  };
  return statusMap[this.role] || 'Unknown Role';
});

// Virtual for access level display
AdminSchema.virtual('accessLevelDisplay').get(function() {
  const accessMap = {
    'read': 'Read Only',
    'write': 'Read & Write',
    'full_access': 'Full Access'
  };
  return accessMap[this.accessLevel] || 'Unknown Access';
});

// Virtual for account locked status
AdminSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Method to check if admin has specific permission
AdminSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission);
};

// Method to check if admin can manage another admin
AdminSchema.methods.canManage = function(targetAdmin) {
  if (this.role === 'super_admin') return true;
  if (this.adminLevel > targetAdmin.adminLevel) return true;
  return false;
};

// Method to increment login attempts
AdminSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // If this is the 5th attempt and we're not locked already, lock the account
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Indexes for better performance
AdminSchema.index({ email: 1 }, { unique: true });
AdminSchema.index({ role: 1 });
AdminSchema.index({ isActive: 1 });
AdminSchema.index({ adminLevel: 1 });
AdminSchema.index({ accessLevel: 1 });
AdminSchema.index({ createdBy: 1 });
AdminSchema.index({ managedBy: 1 });

export default mongoose.model("Admin", AdminSchema);
