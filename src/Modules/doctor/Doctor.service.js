import UserModel from "../../DB/Models/users.model.js";
import Consultations from "../../DB/Models/Consultation.model.js";
import SUCCESS from "../../Utils/SuccessfulRes.js";
import streamifier from "streamifier";
import cloudinary from "../../Middlewares/cloudinary.js";

export const Doctors = async (req, res, next) => {
  const { government, specialest } = req.query;
  const filter = { userType: "DOCTOR", acceptTerms: true };
  if (government) filter.government = government;
  if (specialest) filter.specialest = specialest;

  const doctors = await UserModel.find(filter).select(
    "-password -role -__v -phone -createdAt -updatedAt"
  );

  if (doctors.length === 0)
    return next(new Error("Not Found any Doctors", { cause: 404 }));

  SUCCESS(res, 200, "Doctors are here!", doctors);
};

export const ConsultationsOrders = async (req, res, next) => {
  const { _id } = req.user;
  const consultations = await Consultations.find({ doctor: _id }).populate(
    "patient",
    "firstName middleName lastName phone"
  );

  if (!consultations || consultations.length === 0) {
    return next(new Error("لا توجد استشارات", { cause: 404 }));
  }

  SUCCESS(res, 200, "طلبات الاستشارات من المرضى", consultations);
};

export const updateConsultationStatus = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const { consultationId, status } = req.body;

    const updatedConsultation = await Consultations.findOneAndUpdate(
      { _id: consultationId, doctor: _id }, // يتأكد أن الاستشارة للدكتور ده
      { status },
      { new: true }
    );

    if (!updatedConsultation) {
      return next(new Error("الاستشارة غير موجودة أو لا تخصك", { cause: 404 }));
    }

    SUCCESS(res, 200, "تم تحديث حالة الاستشارة", updatedConsultation);
  } catch (err) {
    next(err);
  }
};

export const Report = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const { consultationId, reportText } = req.body;
    if (!reportText)
      return next(new Error("من فضلك أدخل التقرير", { cause: 400 }));
    const updatedConsultation = await Consultations.findOneAndUpdate(
      { _id: consultationId, doctor: _id, status: "PAID" },
      { report: reportText, status: "COMPLETED" },
      { new: true }
    );
    if (!updatedConsultation) {
      return next(
        new Error(" الاستشارة غير موجودة أو لا تخصك او لم يتم الدفع", {
          cause: 401,
        })
      );
    }
    SUCCESS(res, 200, "تم تحديث حالة الاستشارة", updatedConsultation);
  } catch (err) {
    next(err);
  }
};

export const addReport = async (req, res, next) => {
  try {
    const { consultationId } = req.body;
    const doctor = req.user._id;

    if (!req.file) {
      return res.status(400).json({ error: "برجاء رفع ملف" });
    }

    // نحدد النوع: صورة ولا ملف
    const resourceType = req.file.mimetype.startsWith("image")
      ? "image"
      : "raw";

    // رفع الملف لـ Cloudinary
    const uploadedFile = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "reports",
          resource_type: resourceType,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });

    // تحديث الـ Consultation وحفظ اللينك في report
    const consultation = await Consultations.findOneAndUpdate(
      { _id: consultationId, doctor }, // الشرط: نفس الـ id والدكتور
      { report: uploadedFile.secure_url },
      { new: true }
    );

    if (!consultation) {
      return res.status(404).json({ error: "الاستشارة غير موجودة" });
    }

    res.status(200).json({
      message: "تم رفع التقرير وربطه بالاستشارة",
      consultation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "حصل خطأ أثناء رفع التقرير" });
  }
};
