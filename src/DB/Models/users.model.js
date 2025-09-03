import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'premium', 'researcher', 'scientist', 'moderator'],
      default: 'user',
    },
    permissions: [{
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
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'basic', 'premium', 'enterprise'],
        default: 'free',
      },
      startDate: Date,
      endDate: Date,
      isActive: {
        type: Boolean,
        default: false,
      }
    },
    profile: {
      bio: String,
      organization: String,
      location: String,
      website: String,
      profileImage: String,
    },
    lastLogin: Date,
    roleChangedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    roleChangedAt: Date,
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for subscription status
UserSchema.virtual('subscriptionStatus').get(function() {
  if (!this.subscription.isActive) return 'inactive';
  if (new Date() > this.subscription.endDate) return 'expired';
  return 'active';
});

// Virtual for role display name
UserSchema.virtual('roleDisplayName').get(function() {
  const roleNames = {
    'user': 'Regular User',
    'premium': 'Premium User',
    'researcher': 'Researcher',
    'scientist': 'Marine Scientist',
    'moderator': 'Content Moderator'
  };
  return roleNames[this.role] || 'Unknown Role';
});

// Indexes for better performance
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ 'subscription.plan': 1 });
UserSchema.index({ createdAt: -1 });

export default mongoose.model("User", UserSchema);

const ImageSchema = new Schema(
  {
    image: {
      type: String,
      required: true,
      trim: true, // يشيل الفراغات
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    type: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    publicId: {
      type: String,
      required: true,
      unique: true, // يمنع رفع نفس الصورة مرتين
    },
  },
  { timestamps: true }
);

// إنشاء الـ model
export const Image = mongoose.model("Image", ImageSchema);
