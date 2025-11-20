import express from "express";
import multer from "multer";
import { Request, Response, NextFunction, RequestHandler } from "express";
import authController from "../controllers/AuthController";

// import {
//   isAuthorizedUser,
//   isAuthorizedAdmin,
//   isAuthorizedSuperAdmin,
// } from "../middlewares/authValidationJWT";

// import { userValidator } from "../middlewares/validation";

// import fileUpload from "../middlewares/fileUpload";
// import fileUploadMemory from "../middlewares/fileUploadMemory";

const routes = express();
const upload = multer();

const { signUp, login } = authController;

// /api/users

routes.post("/signup", upload.none(), signUp);
routes.post("/login", upload.none(), login);
export default routes;
