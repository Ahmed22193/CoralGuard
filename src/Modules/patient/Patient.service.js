import Consultation from "../../DB/Models/Consultation.model.js";
import usersModel from "../../DB/Models/users.model.js";
import SUCCESS from "../../Utils/SuccessfulRes.js";

import cloudinary from "../../Middlewares/cloudinary.js";
import streamifier from "streamifier";


export const createConsultation = async (req, res, next) => {
  const { _id } = req.user;
  const { doctorId, description, type } = req.body;

  if (!_id) return next(new Error("بيانات المريض غير موجودة", { cause: 400 }));
  if (req.user.userType !== "PATIENT") return next(new Error("فقط المرضى يمكنهم إنشاء استشارة", { cause: 403 }));

  try {
    // رفع الملفات إلى Cloudinary لو موجودة
    const attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadedFile = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "consultations_files" }, // فولدر في Cloudinary
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });

        attachments.push({
          fileName: file.originalname,
          fileUrl: uploadedFile.secure_url,
        });
      }
    }

    // التحقق من وجود الدكتور
    const doctor = await usersModel.findOne({ _id: doctorId, userType: "DOCTOR" });
    if (!doctor) return next(new Error("الطبيب غير موجود", { cause: 404 }));

    // إنشاء الاستشارة
    const consultation = await Consultation.create({
      patient: _id,
      doctor: doctorId,
      description,
      type,
      attachments
    });

    await consultation.populate("doctor", "firstName middleName lastName specialization");
    await consultation.populate("patient", "firstName middleName lastName phone");

    SUCCESS(res, 201, "تم إنشاء الاستشارة بنجاح", consultation);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyConsultations = async (req, res, next) => {
  const { _id } = req.user;
  const consultations = await Consultation.find({ patient: _id })
    .populate("doctor", "firstName middleName lastName address specialization"); 
  if (!consultations || consultations.length === 0) {
    return next(new Error("لا توجد استشارات", { cause: 404 }));
  }

  SUCCESS(res, 200, "استشاراتك", consultations);
};

export const PAID = async (req, res, next) => {
  const { _id } = req.user;
  const { consultationId } = req.body;
  if (!consultationId) return next(new Error("من فضلك أدخل معرف الاستشارة", { cause: 400 }));
  const updatedConsultation = await Consultation.findOneAndUpdate(
    { _id: consultationId, patient: _id ,status: "ACCEPTED"},
    { status: "PAID" },
    { new: true }
  );
  if (!updatedConsultation) return next(new Error("لم يتم قبول الاستشارة من الطبيب بعد او ان الاستشارة لا تخصك", { cause: 404 }));
  SUCCESS(res, 200, "تم الدفع بنجاح", updatedConsultation);
};

