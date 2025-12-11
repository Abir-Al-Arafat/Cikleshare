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
};

export default authValidator;
