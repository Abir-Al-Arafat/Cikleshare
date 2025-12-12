import { body, param } from "express-validator";

const authValidator = {
  signUp: [
    body("fullName").not().isEmpty().withMessage("fullName is required"),
    body("email").not().isEmpty().withMessage("email is required"),
    body("password").not().isEmpty().withMessage("password is required"),
  ],
  login: [
    body("email").not().isEmpty().withMessage("email is required"),
    body("password").not().isEmpty().withMessage("password is required"),
  ],
  sendToken: [
    body("email").not().isEmpty().withMessage("email is required"),
    body("purpose")
      .not()
      .isEmpty()
      .withMessage("purpose is required")
      .equals("passwordRecovery")
      .withMessage("purpose must be 'passwordRecovery'"),
  ],
  verifyOtp: [
    body("email").not().isEmpty().withMessage("email is required"),
    body("otp")
      .not()
      .isEmpty()
      .withMessage("otp is required")
      .isLength({ min: 6, max: 6 })
      .withMessage("otp must be 6 digits"),
    body("purpose")
      .not()
      .isEmpty()
      .withMessage("purpose is required")
      .isIn(["passwordRecovery", "emailVerification", "twoFactorAuth"])
      .withMessage("Invalid purpose value"),
  ],
  resetPassword: [
    body("email").not().isEmpty().withMessage("email is required"),
    body("newPassword")
      .not()
      .isEmpty()
      .withMessage("newPassword is required")
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters"),
    body("confirmPassword")
      .not()
      .isEmpty()
      .withMessage("confirmPassword is required"),
  ],
};

export default authValidator;
