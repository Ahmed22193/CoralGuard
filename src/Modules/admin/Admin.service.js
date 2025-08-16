import UserModel from "../../DB/Models/users.model.js";
import SUCCESS from "../../Utils/SuccessfulRes.js";
import ConsultationModel from "../../DB/Models/Consultation.model.js";

export const AcceptDoctor = async (req, res, next) => {
  const { doctorId } = req.body;
  const doctor = await UserModel.findOneAndUpdate(
    { _id: doctorId, userType: "DOCTOR", acceptTerms: false },
    { acceptTerms: true },
    { new: true }
  );
  if (!doctor)
    return next(
      new Error("Doctor Not Found or he is accepted already", { cause: 404 })
    );
  SUCCESS(res, 200, "Doctor Accepted", doctor);
};
export const doctorsRegistration = async (req, res, next) => {
  const doctors = await UserModel.find({
    userType: "DOCTOR",
    acceptTerms: false,
  });
  if (doctors.length === 0)
    return next(new Error("No Doctors Found to accepte", { cause: 404 }));
  SUCCESS(res, 200, "Doctors Registration", doctors);
};
export const deleteUser = async (req, res, next) => {
  const { userId } = req.body;
  const user = await UserModel.findByIdAndDelete(userId);
  if (!user) return next(new Error("User Not Found", { cause: 404 }));
  SUCCESS(res, 200, "User Deleted Successfully", user);
};
export const deleteConsultation = async (req, res, next) => {
  const { consultationId } = req.body;
  const consultation = await ConsultationModel.findByIdAndDelete(
    consultationId
  );
  if (!consultation)
    return next(new Error("Consultation Not Found", { cause: 404 }));
  SUCCESS(res, 200, "Consultation Deleted Successfully", consultation);
};
export const getStats = async (req, res, next) => {
  const doctorsCount = await UserModel.countDocuments({ userType: "DOCTOR" });
  const patientsCount = await UserModel.countDocuments({ userType: "PATIENT" });
  const acceptedDoctorsCount = await UserModel.countDocuments({
    userType: "DOCTOR",
    acceptTerms: true,
  });
  const unacceptedDoctorsCount = await UserModel.countDocuments({
    userType: "DOCTOR",
    acceptTerms: false,
  });

  const consultationsWaiting = await ConsultationModel.countDocuments({
    status: "PENDING",
  });
  const consultationsDone = await ConsultationModel.countDocuments({
    status: "COMPLETED",
  });
  const consultationsPaid = await ConsultationModel.countDocuments({
    status: "PAID",
  });
  const consultationsAccepted = await ConsultationModel.countDocuments({
    status: "ACCEPTED",
  });
  const consultationsRejected = await ConsultationModel.countDocuments({
    status: "REJECTED",
  });
  const totalConsultations = await ConsultationModel.countDocuments();

  SUCCESS(res, 200, "Statistics fetched successfully", {
    users: {
      totalUsers: doctorsCount + patientsCount,
      doctors: doctorsCount,
      patients: patientsCount,
      acceptedDoctors: acceptedDoctorsCount,
      unacceptedDoctors: unacceptedDoctorsCount,
    },
    consultations: {
      totalConsultations: totalConsultations,
      PENDING: consultationsWaiting,
      COMPLETED: consultationsDone,
      PAID: consultationsPaid,
      ACCEPTED: consultationsAccepted,
      REJECTED: consultationsRejected,
    },
  });
};

export const getAllDoctors = async (req, res, next) => {
  const doctors = await UserModel.find({ userType: "DOCTOR" });
  if (!doctors || doctors.length === 0)
    return next(new Error("No Doctors Found", { cause: 404 }));
  SUCCESS(res, 200, "All Doctors", doctors);
};
export const getAllPatients = async (req, res, next) => {
  const patients = await UserModel.find({ userType: "PATIENT" });
  if (!patients || patients.length === 0)
    return next(new Error("No Patients Found", { cause: 404 }));
  SUCCESS(res, 200, "All Patients", patients);
};

export const getAllConsultations = async (req, res, next) => {
  try {
    const { status } = req.query;

    let filter = {};
    if (status) {
      filter.status = status.toUpperCase();
    }

    const consultations = await ConsultationModel.find(filter)
      .populate("doctor", "firstName middleName lastName phone") // عرض بيانات الدكتور (اختياري تحدد الفيلدز)
      .populate("patient", "firstName middleName lastName phone"); // عرض بيانات المريض

    if (!consultations || consultations.length === 0) {
      return next(new Error("No Consultations Found", { cause: 404 }));
    }

    SUCCESS(res, 200, "All Consultations", consultations);
  } catch (err) {
    next(err);
  }
};
