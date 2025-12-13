import { Request, Response } from "express";

import { success, failure } from "../utilities/common";
import { deleteFile } from "../utilities/fileUtils";
// import { IQuery } from "../types/query-params";
// import { IUser } from "../interfaces/user.interface";
// import { TUploadFields } from "../types/upload-fields";
import { validationResult } from "express-validator";
import HTTP_STATUS from "../constants/statusCodes";
// import User from "../models/user.model";
// import Notification from "../models/notification.model";
// import { UserRequest } from "../interfaces/user.interface";
import userService from "../services/UserService";

class UserController {
  // Add your controller methods here
  async getProfile(req: Request, res: Response): Promise<Response> {
    try {
      //   // Assuming user ID is available in req.params.id
      //   const userId = req.params.id;

      //   // Find the user by ID
      //   const user = await User.findById(userId);

      //   if (!user) {
      //     return res.status(HTTP_STATUS.NOT_FOUND).json(failure("User not found"));
      //   }

      return res.status(HTTP_STATUS.OK).json(success("User found"));
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(failure("Error fetching user profile"));
    }
  }

  async updateProfile(req: Request, res: Response): Promise<Response> {
    try {
      const validation = validationResult(req).array();

      if (validation.length) {
        return res
          .status(HTTP_STATUS.OK)
          .send(failure("Failed to update profile", validation[0]?.msg));
      }

      // Get user ID from authenticated user (assuming it's set by auth middleware)
      const userId = (req as any).user?._id;

      if (!userId) {
        return res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .send(failure("User not authenticated"));
      }

      const { username, phone } = req.body;

      // Build updates object with only provided fields
      const updates: { username?: string; phone?: string; image?: string } = {};
      if (username) updates.username = username;
      if (phone) updates.phone = phone;

      // Handle uploaded image file
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (files && files.image && files.image[0]) {
        // Get current user to check for existing image
        const currentUser = await userService.findUserById(userId);

        // Delete old image if it exists
        if (currentUser?.image) {
          deleteFile(currentUser.image);
        }

        // Store the file path relative to public folder
        updates.image = `/public/uploads/images/${files.image[0].filename}`;
      }

      if (Object.keys(updates).length === 0) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .send(failure("No fields to update"));
      }

      const updatedUser = await userService.updateUserProfile(userId, updates);

      if (!updatedUser) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .send(failure("Failed to update profile"));
      }

      return res.status(HTTP_STATUS.OK).send(
        success("Profile updated successfully", {
          user: {
            _id: updatedUser._id,
            username: updatedUser.username,
            phone: updatedUser.phone,
            image: updatedUser.image,
            email: updatedUser.email,
            fullName: updatedUser.fullName,
          },
        })
      );
    } catch (error) {
      console.error("Error updating user profile:", error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }
}

export default new UserController();
