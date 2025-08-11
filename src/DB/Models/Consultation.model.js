import mongoose, { Schema } from "mongoose";

// القيم الثابتة للحالة
export const consultationStatus = {
  pending: "PENDING",
  accepted: "ACCEPTED",
  rejected: "REJECTED",
  paid: "PAID",
  completed: "COMPLETED"
};

// القيم الثابتة لأنواع الاستشارة
export const consultationType = {
  video: "VIDEO",
  written: "WRITTEN"
};

const ConsultationSchema = new Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true
  },
  description: {
    type: String,
    required: true
  },
  attachments: [
    {
      fileName: String,
      fileUrl: String
    }
  ],
  status: {
    type: String,
    enum: Object.values(consultationStatus),
    default: consultationStatus.pending
  },
  type: {
    type: String,
    enum: Object.values(consultationType),
    required: true
  },
  report: {
    type: String,
  }
}, { timestamps: true });

export default mongoose.model("Consultation", ConsultationSchema);
