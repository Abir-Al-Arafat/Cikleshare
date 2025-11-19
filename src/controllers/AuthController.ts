import { Request, Response } from "express";

import { success, failure } from "../utilities/common";
// import { IQuery } from "../types/query-params";
// import { IUser } from "../interfaces/user.interface";
// import { TUploadFields } from "../types/upload-fields";
// import { validationResult } from "express-validator";
import HTTP_STATUS from "../constants/statusCodes";
import authService from "../services/AuthService";
import userService from "../services/UserService";
// import Notification from "../models/notification.model";
// import { UserRequest } from "../interfaces/user.interface";

class AuthController {
  // Add your controller methods here
  async signUp(req: Request, res: Response): Promise<Response> {
    try {
      //   const validation = validationResult(req).array();
      //   if (validation.length) {
      //     return res
      //       .status(HTTP_STATUS.OK)
      //       .send(failure("Failed to add the user", validation[0].msg));
      //   }

      const { fullName, email, password, confirmPassword, role } = req.body;

      console.log(fullName, email, password, confirmPassword, role);

      if (role === "admin") {
        return res
          .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
          .send(failure(`Admin cannot be signed up`));
      }
      const emailExists = await userService.isEmailTaken(email);

      if (emailExists) {
        return res
          .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
          .send(failure(`User with email: ${email} already exists`));
      }

      //   const emailCheck = await User.findOne({ email });

      //   if (emailCheck && !emailCheck.emailVerified) {
      //     return res
      //       .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
      //       .send(failure(`User with email: ${email} already exists`));
      //   }

      //   if (emailCheck) {
      //     return res
      //       .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
      //       .send(failure(`User with email: ${email} already exists`));
      //   }

      const newUser = await authService.signUp(
        fullName,
        email,
        password,
        confirmPassword
      );

      console.log("newUser", newUser);

      if (!newUser.success) {
        return res.status(HTTP_STATUS.OK).send(newUser);
      }

      //   const expiresIn = process.env.JWT_EXPIRES_IN
      //     ? parseInt(process.env.JWT_EXPIRES_IN, 10)
      //     : 3600; // default to 1 hour if not set

      //   const token = jwt.sign(
      //     {
      //       _id: newUser._id,
      //       roles: newUser.roles,
      //     },
      //     process.env.JWT_SECRET ?? "default_secret",
      //     {
      //       expiresIn,
      //     }
      //   );
      //   res.setHeader("Authorization", token);
      //   res.cookie("token", token, {
      //     httpOnly: true,
      //     sameSite: "strict",
      //     secure: process.env.NODE_ENV === "production" ? true : false,
      //     maxAge: expiresIn * 1000,
      //   });
      //   if (newUser) {
      //     return res
      //       .status(HTTP_STATUS.OK)
      //       .send(success("Account created successfully ", { newUser, token }));
      //   }
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(success("Account created successfully"));
    } catch (err) {
      console.log(err);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }
}

export default new AuthController();
