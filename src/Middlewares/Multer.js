import multer from "multer";

const storage = multer.memoryStorage(); // نخزن في الذاكرة مؤقتًا

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("نوع الملف غير مسموح"), false);
  }
};

const upload = multer({ storage, fileFilter });

export default upload;
