import multer from "multer";
import { AppError } from "../utils/app.error";

const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        "Invalid file type. Only JPG, JPEG, PNG, and GIF are allowed",
        400
      )
    );
  }
};

export const uploadSingle = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 }, // 1MB
}).single("image");

export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 }, // 1MB per file
}).array("images", 5);
