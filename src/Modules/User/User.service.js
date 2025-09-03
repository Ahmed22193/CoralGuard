// import usersModel from "../../DB/Models/users.model.js";
import { Image } from "../../DB/Models/users.model.js";
// import { create } from "../../DB/dbService.js";
// import SUCCESS from "../../Utils/SuccessfulRes.js";

import cloudinary from "../../Middlewares/cloudinary.js";
import streamifier from "streamifier";

export const uploadImage = async (req, res, next) => {
  try {
    const user = req.user._id;
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
          folder: "CoralGuard",
          resource_type: resourceType,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });

    const MyImage = await Image.create({
      image: uploadedFile.secure_url,
      publicId: uploadedFile.public_id,
      userId: user,
    });
    console.log(MyImage);
    res.status(200).json({
      message: "تم رفع الصورة بنجاح",
      MyImage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "حصل خطأ أثناء رفع الصورة" });
  }
};
