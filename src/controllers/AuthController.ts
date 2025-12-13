import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { success, failure, generateRandomCode } from "../utilities/common";
// import { IQuery } from "../types/query-params";
// import { IUser } from "../interfaces/user.interface";
// import { TUploadFields } from "../types/upload-fields";
import { validationResult } from "express-validator";
import HTTP_STATUS from "../constants/statusCodes";
import authService from "../services/AuthService";
import userService from "../services/UserService";
import otpService from "../services/OtpService";

import {
  signupEmail,
  recoverPasswordEmail,
} from "../templates/emailTemplateLoader";
import { emailWithNodemailerGmail } from "../config/email.config";

// import Notification from "../models/notification.model";
// import { UserRequest } from "../interfaces/user.interface";

class AuthController {
  // Add your controller methods here
  async signUp(req: Request, res: Response): Promise<Response> {
    try {
      const validation = validationResult(req).array();

      if (validation.length) {
        return res
          .status(HTTP_STATUS.OK)
          .send(failure("Failed to add the user", validation[0]?.msg));
      }

      const { fullName, email, password, confirmPassword, role } = req.body;

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

      if (password !== confirmPassword) {
        return res
          .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
          .send(failure("Passwords do not match"));
      }

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

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await authService.signUp(fullName, email, hashedPassword);

      if (!newUser) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .send(failure("Account creation failed"));
      }

      const expiresIn = process.env.JWT_EXPIRES_IN
        ? parseInt(process.env.JWT_EXPIRES_IN, 10)
        : 3600; // default to 1 hour if not set

      const token = jwt.sign(
        {
          _id: newUser._id,
          roles: newUser.roles,
        },
        process.env.JWT_SECRET ?? "default_secret",
        {
          expiresIn,
        }
      );
      res.setHeader("Authorization", token);
      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production" ? true : false,
        maxAge: expiresIn * 1000,
      });
      //   const emailVerifyCode = generateRandomCode(6);
      //   const emailData = signupEmail(
      //     newUser?.fullName!,
      //     emailVerifyCode,
      //     req.body.email
      //   );

      //   emailWithNodemailerGmail(emailData);

      if (newUser) {
        return res.status(HTTP_STATUS.OK).send(
          success("Account created successfully ", {
            // newUser,
            token,
          })
        );
      }
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

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;

      const user = await userService.findUserByEmail(email, {
        includePassword: true,
      });

      if (!user) {
        return res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .send(failure("Please sign up first"));
      }

      if (!user.password) {
        return res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .send(failure("password not found"));
      }

      const isPasswordValid = await bcrypt.compare(password, user.password!);

      if (!isPasswordValid) {
        return res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .send(failure("Invalid credentials"));
      }

      const expiresIn = process.env.JWT_EXPIRES_IN
        ? parseInt(process.env.JWT_EXPIRES_IN, 10)
        : 3600; // default to 1 hour if not set

      const token = jwt.sign(
        {
          _id: user._id,
          roles: user.roles,
        },
        process.env.JWT_SECRET ?? "default_secret",
        {
          expiresIn,
        }
      );

      res.setHeader("Authorization", token);
      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production" ? true : false,
        maxAge: expiresIn * 1000,
      });

      return res.status(HTTP_STATUS.OK).send(
        success("Login successful", {
          //   user,
          token,
        })
      );
    } catch (err) {
      console.log(err);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }

  async sendToken(req: Request, res: Response): Promise<Response> {
    try {
      const validation = validationResult(req).array();

      if (validation.length) {
        return res
          .status(HTTP_STATUS.OK)
          .send(failure("failed to send token", validation[0]?.msg));
      }

      const { email, purpose } = req.body;

      const user = await userService.findUserByEmail(email);

      if (!user) {
        return res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .send(failure("Please sign up first"));
      }

      // Handle different purposes
      if (purpose === "passwordRecovery") {
        const verificationCode = generateRandomCode(6);

        // Save OTP to database
        const otpCreated = await otpService.createOtp(
          email,
          verificationCode.toString(),
          purpose,
          user._id.toString()
        );

        if (!otpCreated) {
          return res
            .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
            .send(failure("Failed to generate verification code"));
        }

        const emailData = await recoverPasswordEmail(
          user.fullName,
          verificationCode.toString(),
          email
        );

        emailWithNodemailerGmail(emailData);

        return res.status(HTTP_STATUS.OK).send(
          success("Password recovery email sent successfully", {
            message:
              "Please check your email for the verification code. It will expire in 3 minutes.",
          })
        );
      }

      // Default behavior: generate and return token
      const expiresIn = process.env.JWT_EXPIRES_IN
        ? parseInt(process.env.JWT_EXPIRES_IN, 10)
        : 3600; // default to 1 hour if not set

      const token = jwt.sign(
        {
          _id: user._id,
          roles: user.roles,
        },
        process.env.JWT_SECRET ?? "default_secret",
        {
          expiresIn,
        }
      );

      res.setHeader("Authorization", token);
      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production" ? true : false,
        maxAge: expiresIn * 1000,
      });

      return res.status(HTTP_STATUS.OK).send(
        success("Token sent successfully", {
          token,
        })
      );
    } catch (err) {
      console.log(err);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<Response> {
    try {
      const validation = validationResult(req).array();

      if (validation.length) {
        return res
          .status(HTTP_STATUS.OK)
          .send(failure("Failed to verify OTP", validation[0]?.msg));
      }

      const { email, otp, purpose } = req.body;

      const user = await userService.findUserByEmail(email);

      if (!user) {
        return res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .send(failure("User not found"));
      }

      const isValid = await otpService.verifyOtp(email, otp, purpose);

      if (!isValid) {
        return res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .send(failure("Invalid or expired OTP"));
      }

      return res.status(HTTP_STATUS.OK).send(
        success("OTP verified successfully", {
          email,
        })
      );
    } catch (err) {
      console.log(err);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }

  async resetPassword(req: Request, res: Response): Promise<Response> {
    try {
      const validation = validationResult(req).array();

      if (validation.length) {
        return res
          .status(HTTP_STATUS.OK)
          .send(failure("Failed to reset password", validation[0]?.msg));
      }

      const { email, newPassword, confirmPassword } = req.body;

      // Check if user has verified OTP first
      const hasVerifiedOtp = await otpService.hasVerifiedOtp(
        email,
        "passwordRecovery"
      );

      if (!hasVerifiedOtp) {
        return res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .send(failure("Please verify OTP first before resetting password"));
      }

      // Check if passwords match
      if (newPassword !== confirmPassword) {
        return res
          .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
          .send(failure("Passwords do not match"));
      }

      // Find user
      const user = await userService.findUserByEmail(email);

      if (!user) {
        return res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .send(failure("User not found"));
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      user.password = hashedPassword;
      await user.save();

      // Delete the used OTP
      await otpService.deleteOtps(email, "passwordRecovery");

      return res.status(HTTP_STATUS.OK).send(
        success("Password reset successfully", {
          message: "You can now login with your new password",
        })
      );
    } catch (err) {
      console.log(err);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }
}

export default new AuthController();
