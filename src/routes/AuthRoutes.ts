import express from "express";
import multer from "multer";
import { Request, Response, NextFunction, RequestHandler } from "express";
import authController from "../controllers/AuthController";

// import {
//   isAuthorizedUser,
//   isAuthorizedAdmin,
//   isAuthorizedSuperAdmin,
// } from "../middlewares/authValidationJWT";

import authValidator from "../validators/authValidator";

// import fileUpload from "../middlewares/fileUpload";
// import fileUploadMemory from "../middlewares/fileUploadMemory";

const routes = express();
const upload = multer();

const { signUp, login, sendToken, verifyOtp, resetPassword } = authController;

// /api/users

routes.post("/signup", upload.none(), authValidator.signUp, signUp);
routes.post("/login", upload.none(), login);
routes.post("/send-token", upload.none(), authValidator.sendToken, sendToken);
routes.post("/verify-otp", upload.none(), authValidator.verifyOtp, verifyOtp);
routes.post(
  "/reset-password",
  upload.none(),
  authValidator.resetPassword,
  resetPassword
);

export default routes;
