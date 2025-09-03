import mongoose, { Schema } from "mongoose";

const AdminActivityLogSchema = new Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'login',
        'logout',
        'create_user',
        'update_user',
        'delete_user',
        'moderate_content',
        'system_update',
        'backup_created',
        'security_update',
        'permission_change'
      ]
    },
    targetType: {
      type: String,
      enum: ['User', 'Admin', 'Content', 'System', 'Security'],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    description: {
      type: String,
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
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low',
    },
  },
  { 
    timestamps: true 
  }
);

// Index for better performance
AdminActivityLogSchema.index({ adminId: 1 });
AdminActivityLogSchema.index({ action: 1 });
AdminActivityLogSchema.index({ createdAt: -1 });
AdminActivityLogSchema.index({ severity: 1 });

export default mongoose.model("AdminActivityLog", AdminActivityLogSchema);
