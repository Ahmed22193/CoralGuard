import mongoose, { Schema } from "mongoose";

const UserRoleHistorySchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    previousRole: {
      type: String,
      enum: ['user', 'premium', 'researcher', 'scientist', 'moderator'],
      required: true,
    },
    newRole: {
      type: String,
      enum: ['user', 'premium', 'researcher', 'scientist', 'moderator'],
      required: true,
    },
    previousPermissions: [{
      type: String,
      enum: [
        'image_upload',
        'advanced_analysis',
        'data_export',
        'bulk_upload',
        'api_access',
        'priority_support'
      ]
    }],
    newPermissions: [{
      type: String,
      enum: [
        'image_upload',
        'advanced_analysis',
        'data_export',
        'bulk_upload',
        'api_access',
        'priority_support'
      ]
    }],
    reason: {
      type: String,
      required: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
  },
  { 
    timestamps: { createdAt: 'changedAt', updatedAt: false }
  }
);

// Index for better performance
UserRoleHistorySchema.index({ userId: 1 });
UserRoleHistorySchema.index({ changedBy: 1 });
UserRoleHistorySchema.index({ changedAt: -1 });
UserRoleHistorySchema.index({ newRole: 1 });

export default mongoose.model("UserRoleHistory", UserRoleHistorySchema);
