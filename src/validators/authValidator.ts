import { body, param } from "express-validator";

const authValidator = {
  signUp: [
    body("fullName").not().isEmpty().withMessage("fullName is required"),
    body("email").not().isEmpty().withMessage("email is required"),
    body("password").not().isEmpty().withMessage("password is required"),
  ],
};

export default authValidator;
