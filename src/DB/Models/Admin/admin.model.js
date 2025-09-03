import mongoose, { Schema } from "mongoose";

const AdminSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['super_admin', 'admin', 'moderator'],
      default: 'admin',
    },
    permissions: [{
      type: String,
      enum: [
        'user_management',
        'content_moderation',
        'system_settings',
        'analytics_view',
        'backup_restore',
        'security_management'
      ]
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    profileImage: {
      type: String,
    },
    phone: {
      type: String,
    },
    department: {
      type: String,
    },
    createdBy: {
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

// Virtual for full name
AdminSchema.virtual('fullName').get(function() {
  return this.name;
});

// Index for better performance
AdminSchema.index({ email: 1 });
AdminSchema.index({ role: 1 });
AdminSchema.index({ isActive: 1 });

export default mongoose.model("Admin", AdminSchema);
