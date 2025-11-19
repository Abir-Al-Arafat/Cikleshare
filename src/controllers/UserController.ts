import { Request, Response } from "express";

import { success, failure } from "../utilities/common";
// import { IQuery } from "../types/query-params";
// import { IUser } from "../interfaces/user.interface";
// import { TUploadFields } from "../types/upload-fields";
// import { validationResult } from "express-validator";
import HTTP_STATUS from "../constants/statusCodes";
// import User from "../models/user.model";
// import Notification from "../models/notification.model";
// import { UserRequest } from "../interfaces/user.interface";
// import userService from "../services/user.service";

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
}

export default new UserController();
