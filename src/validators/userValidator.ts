import { body } from "express-validator";

const userValidator = {
  updateProfile: [
    body("username")
      .optional()
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters"),
    body("phone")
      .optional()
      .matches(/^[0-9+\-\s()]+$/)
      .withMessage("Invalid phone number format"),
  ],
};

export default userValidator;
