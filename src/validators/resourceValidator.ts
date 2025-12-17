import { body, param } from "express-validator";

const resourceValidator = {
  createResource: [
    body("title")
      .not()
      .isEmpty()
      .withMessage("Title is required")
      .isLength({ min: 5 })
      .withMessage("Title must be at least 5 characters"),
    body("type")
      .not()
      .isEmpty()
      .withMessage("Resource type is required")
      .isIn([
        "Health Article",
        "Education",
        "Job Resources",
        "Clinical Trial Information",
        "Government Support Programmes",
        "Local Treatment Centres",
        "Healthcare Charities",
        "Medication",
      ])
      .withMessage("Invalid resource type"),
    body("country").not().isEmpty().withMessage("Country is required"),
    body("description").not().isEmpty().withMessage("Description is required"),
    //   .isLength({ min: 20 })
    //   .withMessage("Description must be at least 20 characters"),
  ],
  updateResource: [
    param("id").isMongoId().withMessage("Invalid resource ID"),
    body("title")
      .optional()
      .isLength({ min: 5 })
      .withMessage("Title must be at least 5 characters"),
    body("type")
      .optional()
      .isIn([
        "Health Article",
        "Education",
        "Job Resources",
        "Clinical Trial Information",
        "Government Support Programmes",
        "Local Treatment Centres",
        "Healthcare Charities",
        "Medication",
      ])
      .withMessage("Invalid resource type"),
    body("country").optional(),
    body("description").optional(),
    // .isLength({ min: 20 })
    // .withMessage("Description must be at least 20 characters"),
  ],
  getResourceById: [param("id").isMongoId().withMessage("Invalid resource ID")],
  deleteResource: [param("id").isMongoId().withMessage("Invalid resource ID")],
};

export default resourceValidator;
