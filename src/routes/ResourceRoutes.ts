import express from "express";
import resourceController from "../controllers/ResourceController";
import resourceValidator from "../validators/resourceValidator";
import fileUpload from "../middlewares/fileUpload";

import {
  isAuthorizedUser,
  isAuthorizedAdmin,
} from "../middlewares/authValidationJWT";

const routes = express();

const {
  createResource,
  getAllResources,
  getResourceById,
  updateResource,
  deleteResource,
} = resourceController;

// Public routes
routes.get("/", getAllResources);
routes.get("/:id", resourceValidator.getResourceById, getResourceById);

// Protected routes (require authentication)
routes.post(
  "/",
  isAuthorizedUser,
  fileUpload(),
  resourceValidator.createResource,
  createResource
);
routes.patch(
  "/:id",
  isAuthorizedUser,
  fileUpload(),
  resourceValidator.updateResource,
  updateResource
);
routes.delete(
  "/:id",
  isAuthorizedUser,
  resourceValidator.deleteResource,
  deleteResource
);

export default routes;
