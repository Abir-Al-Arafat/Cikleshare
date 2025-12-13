import path from "path";
import fs from "fs";

export const deleteFile = (filePath: string) => {
  const oldFilePath = path.join(__dirname, "../../", filePath);
  console.log("oldFilePath", oldFilePath);
  fs.unlink(oldFilePath, (err) => {
    if (err) {
      console.error("Failed to delete old file:", err);
    }
  });
};
export const saveFile = (
  file: Express.Multer.File,
  uploadDir: string
): string => {
  const fileName = `${Date.now()}-${file.originalname}`;
  const filePath = path.join(uploadDir, fileName);
  fs.writeFileSync(filePath, file.buffer);
  return filePath;
};

/**
 * Save a file to disk and optionally delete the old one
 * @param file Express.Multer.File - uploaded file
 * @param oldFilePath string | null - relative path to old file (if any)
 * @param uploadDir string - directory to save new file
 * @returns string | null - new file path relative to project
 */
export const handleFileUpload = (
  file?: Express.Multer.File,
  oldFilePath: string | null = null,
  uploadDir: string = "public/uploads/images"
): string | null => {
  if (!file) return null;

  // Ensure upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Delete old file if exists
  if (oldFilePath) {
    const fullOldPath = path.join(process.cwd(), oldFilePath);
    fs.unlink(fullOldPath, (err) => {
      if (err) console.error("Failed to delete old file:", err);
    });
  }

  // Create unique filename
  const newFileName = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
  const newFilePath = path.join(uploadDir, newFileName);

  // Save file to disk
  fs.writeFileSync(newFilePath, file.buffer);

  // Return relative path to store in DB
  return `${uploadDir}/${newFileName}`;
};
