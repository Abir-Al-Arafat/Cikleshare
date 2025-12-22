import { Request, Response } from "express";
import { validationResult } from "express-validator";

import { success, failure } from "../utilities/common";
import { deleteFile } from "../utilities/fileUtils";
import HTTP_STATUS from "../constants/statusCodes";
import resourceService from "../services/ResourceService";
import { IResource } from "../interfaces/ResourceInterface";
import { TUploadFields } from "../types/upload-fields";

class ResourceController {
  async createResource(req: Request, res: Response): Promise<Response> {
    try {
      // Handle uploaded files first
      let imagePaths: string[] = [];
      const files = req.files as TUploadFields;

      if (files && files.images && files.images.length) {
        imagePaths = files.images.map(
          (file) => `/public/uploads/images/${file.filename}`
        );
      }

      // Check validation
      const validation = validationResult(req).array();

      if (validation.length) {
        // Delete uploaded files on validation failure
        if (imagePaths.length) {
          imagePaths.forEach((img) => deleteFile(img));
        }
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .send(failure("Validation failed", validation[0]?.msg));
      }

      // Get user ID from authenticated user
      const userId = (req as any).user?._id;

      if (!userId) {
        // Delete uploaded files on auth failure
        if (imagePaths.length) {
          imagePaths.forEach((img) => deleteFile(img));
        }
        return res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .send(failure("User not authenticated"));
      }

      const { title, type, country, description, department } = req.body;

      const payload = {
        title,
        type,
        country,
        description,
        department,
        ...(imagePaths.length > 0 ? { images: imagePaths } : {}),
        createdBy: userId,
      };

      const resource = await resourceService.createResource(
        payload as IResource
      );

      if (!resource) {
        // Delete uploaded files on creation failure
        if (imagePaths.length) {
          imagePaths.forEach((img) => deleteFile(img));
        }
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .send(failure("Failed to create resource"));
      }

      return res
        .status(HTTP_STATUS.CREATED)
        .send(success("Resource created successfully", { resource }));
    } catch (error) {
      console.error("Error creating resource:", error);

      // Delete uploaded files on any error
      const files = req.files as TUploadFields;
      if (files && files.images && files.images.length > 0) {
        files.images.forEach((file) => {
          deleteFile(`/public/uploads/images/${file.filename}`);
        });
      }

      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }

  /**
   * Get all resources with pagination and filters
   */
  async getAllResources(req: Request, res: Response): Promise<Response> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      //   const country = req.query.country as string;
      //   const resourceType = req.query.resourceType as string;
      const department = req.query.department as string;
      const search = req.query.search as string;

      const result = await resourceService.getAllResources(page, limit, {
        // country,
        // resourceType,
        department,
        search,
      });

      if (!result) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .send(failure("Failed to fetch resources"));
      }

      return res
        .status(HTTP_STATUS.OK)
        .send(success("Resources fetched successfully", result));
    } catch (error) {
      console.error("Error fetching resources:", error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }

  /**
   * Get a single resource by ID
   */
  async getResourceById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const resource = await resourceService.getResourceById(id as string);

      if (!resource) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("Resource not found"));
      }

      return res
        .status(HTTP_STATUS.OK)
        .send(success("Resource fetched successfully", { resource }));
    } catch (error) {
      console.error("Error fetching resource:", error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }

  /**
   * Update a resource
   */
  async updateResource(req: Request, res: Response): Promise<Response> {
    try {
      const validation = validationResult(req).array();

      if (validation.length) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .send(failure("Validation failed", validation[0]?.msg));
      }

      const { id } = req.params;
      const { title, resourceType, country, description } = req.body;

      // Handle uploaded files first (before checking resource exists)
      const files = req.files as TUploadFields;
      let newImagePaths: string[] = [];

      if (files && files.images && files.images.length > 0) {
        newImagePaths = files.images.map(
          (file) => `/public/uploads/images/${file.filename}`
        );
      }

      // Get current resource
      const currentResource = await resourceService.getResourceById(
        id as string
      );

      if (!currentResource) {
        // Delete uploaded files since resource doesn't exist
        if (newImagePaths.length > 0) {
          newImagePaths.forEach((img) => deleteFile(img));
        }
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("Resource not found"));
      }

      // Build updates object
      const updates: {
        title?: string;
        resourceType?: string;
        country?: string;
        description?: string;
        images?: string[];
      } = {};

      if (title) updates.title = title;
      if (resourceType) updates.resourceType = resourceType;
      if (country) updates.country = country;
      if (description) updates.description = description;

      let oldImagesToDelete: string[] = [];

      if (files && files.images && files.images.length) {
        updates.images = newImagePaths;
        if (currentResource.images && currentResource.images.length) {
          oldImagesToDelete = [...currentResource.images];
        }
      }

      // Try to update the resource
      const resource = await resourceService.updateResource(
        id as string,
        updates
      );

      if (!resource) {
        // Update failed - delete newly uploaded files
        if (newImagePaths.length) {
          newImagePaths.forEach((img) => deleteFile(img));
        }
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .send(failure("Failed to update resource"));
      }

      // Update succeeded - delete old files
      if (oldImagesToDelete.length) {
        oldImagesToDelete.forEach((img) => deleteFile(img));
      }

      return res
        .status(HTTP_STATUS.OK)
        .send(success("Resource updated successfully", { resource }));
    } catch (error) {
      console.error("Error updating resource:", error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }

  /**
   * Delete a resource
   */
  async deleteResource(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      // Get resource to delete associated image
      const resource = await resourceService.getResourceById(id as string);

      if (!resource) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("Resource not found"));
      }

      // Delete images if exist
      if (resource.images && resource.images.length) {
        resource.images.forEach((img) => deleteFile(img));
      }

      const deleted = await resourceService.deleteResource(id as string);

      if (!deleted) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .send(failure("Failed to delete resource"));
      }

      return res
        .status(HTTP_STATUS.OK)
        .send(success("Resource deleted successfully"));
    } catch (error) {
      console.error("Error deleting resource:", error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }
}

export default new ResourceController();
