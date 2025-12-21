import { Request, Response, NextFunction, Express } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const configureFileUpload = () => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      let uploadPath = "";
      if (file.mimetype.startsWith("image/")) {
        uploadPath = path.join(__dirname, "../../public/uploads/images");
      } else if (file.mimetype.startsWith("video/")) {
        uploadPath = path.join(__dirname, "../../public/uploads/videos");
      } else if (file.mimetype.startsWith("audio/")) {
        uploadPath = path.join(__dirname, "../../public/uploads/audios");
      } else if (file.mimetype === "application/pdf") {
        uploadPath = path.join(__dirname, "../../public/uploads/pdfs");
      } else {
        cb(new Error("Invalid file type"), "");
        return;
      }

      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const name = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
      cb(null, name);
    },
  });

  const fileFilter = (req: Request, file: Express.Multer.File, cb: any) => {
    const allowedFieldnames = [
      "productImage",
      "image",
      "images",
      "categoryImage",
      "videoFile",
      "audioFile",
      "pdfFiles",
      "previewPdfFiles",
    ];

    if (file.fieldname === undefined) {
      cb(null, true);
    } else if (allowedFieldnames.includes(file.fieldname)) {
      if (
        file.mimetype.startsWith("image/") ||
        file.mimetype.startsWith("video/") ||
        file.mimetype.startsWith("audio/") ||
        file.mimetype === "application/pdf"
      ) {
        cb(null, true);
      } else {
        cb(new Error("Invalid file type"));
      }
    } else {
      cb(new Error("Invalid fieldname"));
    }
  };

  const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
  }).fields([
    { name: "productImage", maxCount: 10 },
    { name: "image", maxCount: 1 },
    { name: "images", maxCount: 10 },
    { name: "categoryImage", maxCount: 1 },
    { name: "videoFile", maxCount: 1 },
    { name: "audioFile", maxCount: 1 },
    { name: "pdfFiles", maxCount: 5 },
    { name: "previewPdfFiles", maxCount: 3 },
  ]);

  return upload;
};

export default configureFileUpload;
