import mongoose, { Schema } from "mongoose";

const SystemSettingsSchema = new Schema(
  {
    settingKey: {
      type: String,
      required: true,
      // unique: true, // Removed to avoid duplicate index warning
    },
    settingValue: {
      type: Schema.Types.Mixed,
      required: true,
    },
    description: {
      type: String,
    },
    category: {
      type: String,
      enum: ['security', 'performance', 'ui', 'email', 'storage', 'api', 'general'],
      default: 'general',
    },
    isEditable: {
      type: Boolean,
      default: true,
    },
    dataType: {
      type: String,
      enum: ['string', 'number', 'boolean', 'object', 'array'],
      default: 'string',
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { 
    timestamps: true 
  }
);

// Index for better performance
SystemSettingsSchema.index({ settingKey: 1 }, { unique: true });
SystemSettingsSchema.index({ category: 1 });

export default mongoose.model("SystemSettings", SystemSettingsSchema);
