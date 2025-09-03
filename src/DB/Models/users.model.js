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
  },
  { timestamps: true }
);

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
